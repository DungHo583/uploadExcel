// app/ExcelUpload.tsx
"use client";

import { useState } from 'react';
import * as XLSX from 'xlsx';

export default function CheckUpload() {
    const [serialList, setSerialList] = useState<{ serial: string, fileName: string }[]>([])
    const [countFile, setCountFile] = useState(0)
    const [loading, setLoading] = useState(false)
    const [dataRes, setDataRes] = useState([])
    const [textRes, setTextRes] = useState("")

    function handleUploadFiles(event: React.ChangeEvent<HTMLInputElement>) {
        const files = event.target.files;
        if (!files) return;
        setCountFile(files.length)
        const serialNumbers: { serial: string, fileName: string }[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });

                workbook.SheetNames.forEach((sheetName) => {
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    const serialIndex = (jsonData[0] as any).indexOf("Serial")
                    if (serialIndex !== -1) {
                        jsonData.slice(1).forEach((row: any) => {
                            if (row[serialIndex]) {
                                serialNumbers.push({ serial: row[serialIndex].toString(), fileName: file.name });
                            }
                        });
                        setSerialList(serialNumbers)
                    }
                });
            };
            reader.onerror = (error) => {
                console.log(error);
            };
            reader.readAsArrayBuffer(file);
        }
    }

    const handleCheck = async () => {
        setLoading(true)
        const resCheck = await fetch("/api/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: serialList })
        });

        if (resCheck.ok) {
            setLoading(false)
            const result = await resCheck.json();
            setTextRes(result.check)
            setDataRes(result.data)
        } else {
            setLoading(false)
            console.log("[ERROR]:", resCheck.status);
        }
    }

    return (
        <div className="w-full h-screen">
            <div className="w-full flex justify-center items-center pt-4">
                <label htmlFor="file-upload" className="uploadButton">
                    Chọn File Excel
                    <input
                        id="file-upload"
                        type="file"
                        accept=".xlsx, .xls"
                        multiple
                        onChange={handleUploadFiles}
                        className="fileInput "
                    />
                </label>
                <button className="ml-3 px-[20px] py-[10px] bg-blue-500 hover:bg-blue-700 text-white border border-blue-700 rounded"
                    onClick={handleCheck} disabled={loading}>
                    Check
                </button>
                <button className="ml-3 px-[20px] py-[10px] border-white border-solid border rounded hover:bg-gray-600"
                    onClick={() => { window.location.reload() }}>
                    Refresh
                </button>
            </div>
            <div className="w-full text-center mt-4">
                Số lượng file đã chọn: {countFile} | Số lượng serial đọc được: {serialList.length}
            </div>
            {loading && (
                <div className="w-full text-center mt-4">Đang check ...</div>
            )}
            {!loading && textRes && (
                <div className="w-full text-center mt-4">{textRes}</div>
            )}
            {!loading && dataRes.length != 0 &&
                (
                    <div className="w-full text-center mt-4">
                        Số lượng: {dataRes.length}
                        <div className="overflow-y-auto" style={{height: "calc(100dvh - 182px)"}}>
                            {dataRes.map((item: any, idx) => {
                                return (
                                    <div className="" key={idx}>Serial: {item.serial} | File: {item.fileName}</div>
                                )
                            })}
                        </div>
                    </div>
                )
            }
        </div>
    );
}
