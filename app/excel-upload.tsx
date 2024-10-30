// app/ExcelUpload.tsx
"use client";

import { useState, ChangeEvent } from "react";
import * as XLSX from "xlsx";

export default function ExcelUpload() {
  const [fileName, setFileName] = useState<string>("");
  const [duplicates, setDuplicates] = useState<string[]>([]);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    const resGetFile = await fetch("/api/api/get-serials", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!resGetFile.ok) {
      if (file) {
        const reader = new FileReader();

        reader.onload = async (event) => {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json<{ Serial?: string }>(
            worksheet
          );

          const serialData = jsonData
            .map((row) => {
              return row.Serial;
            })
            .filter((serial): serial is string => Boolean(serial));

          // Save to .txt file
          const textData = serialData.join("\n");

          const res = await fetch("/api/api/save-text", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: textData }),
          });

          if (res.ok) {
            const result = await res.json();
            setFileName(result.fileName);
          }
        };

        reader.readAsArrayBuffer(file);
      }
    }

    if (resGetFile.ok) {
      if (file) {
        const textDataFile = await resGetFile.json();
        const existingData = textDataFile.data
          .split("\n")
          .map((line: any) => line.trim())
          .filter(Boolean);

        const reader = new FileReader();

        reader.onload = async (event) => {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json<{ Serial?: string }>(
            worksheet
          );

          const serialData = jsonData
            .map((row) => {
              return row.Serial;
            })
            .filter((serial): serial is string => Boolean(serial));

          const duplicateSerials = serialData.filter((serial) => {
            return existingData.includes(serial);
          });

          if (duplicateSerials.length == 0) {
            const serialData = jsonData
              .map((row) => {
                return row.Serial;
              })
              .filter((serial): serial is string => Boolean(serial));

            // Save to .txt file
            const textData = serialData.join("\n");

            const res = await fetch("/api/api/save-text", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: textData }),
            });

            if (res.ok) {
              const result = await res.json();
              setFileName(result.fileName);
            }
          }

          setDuplicates(duplicateSerials);
        };

        reader.readAsArrayBuffer(file);
      }
    }
  };

  return (
    <div>
      <label htmlFor="file-upload" className="uploadButton">
        Choose Excel File
        <input
          id="file-upload"
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="fileInput"
        />
      </label>
      <button className="px-3 py-4" onClick={() => { window.location.reload() }}>Reload</button>
      {fileName && (
        <p>
          File saved as: <a href={`/${fileName}`}>{fileName}</a>
        </p>
      )}
      {duplicates.length > 0 && (
        <div>
          <h3>Duplicate serials found:</h3>
          <ul>
            {duplicates.map((serial, index) => (
              <li key={index}>{serial}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
