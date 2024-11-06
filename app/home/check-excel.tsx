"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { FaCopy } from "react-icons/fa";

export default function CheckUpload() {
    const [serialList, setSerialList] = useState<
        { stt: string; serial: string; fileName: string }[]
    >([]);
    const [countFile, setCountFile] = useState(0);
    const [loading, setLoading] = useState(false);
    const [loadingCount, setLoadingCount] = useState(false);
    const [dataRes, setDataRes] = useState([]);
    const [textRes, setTextRes] = useState("");
    const [errText, setErrText] = useState("");

    function handleUploadFiles(event: React.ChangeEvent<HTMLInputElement>) {
        setLoadingCount(true);
        setCountFile(0);
        setSerialList([]);
        setDataRes([]);
        setTextRes("");
        setErrText("");
        const files = event.target.files;
        if (!files) return;
        setCountFile(files.length);
        const serialNumbers: { stt: string; serial: string; fileName: string }[] =
            [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: "array" });
                let findSheet = workbook.SheetNames.find((sheet) =>
                    sheet.toLowerCase().includes("tổng")
                );
                if (!findSheet) {
                    if (workbook.SheetNames.length = 2) {
                        findSheet = workbook.SheetNames.find((sheet) => !sheet?.toLowerCase().includes("sheet1"))
                    }
                    if (workbook.SheetNames.length = 1) {
                        findSheet = workbook.SheetNames[0]
                    }
                }

                if (!findSheet) {
                    setLoadingCount(false);
                    setErrText("File không đúng định dạng!");
                    return
                }

                const worksheet = workbook.Sheets[findSheet];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                const findSerial = (jsonData[0] as any).find((val: any) =>
                    val.toLowerCase().includes("serial")
                );
                if (!findSerial) {
                    setLoadingCount(false);
                    setErrText("Thiếu Cột Serial! Kiểm tra lại file");
                    return;
                }
                const serialIndex = (jsonData[0] as any).indexOf(findSerial);
                if (serialIndex !== -1) {
                    jsonData.slice(1).forEach((row: any) => {
                        if (row[serialIndex]) {
                            serialNumbers.push({
                                stt: row[0],
                                serial: row[serialIndex].toString(),
                                fileName: file.name,
                            });
                        }
                    });
                    setSerialList(serialNumbers);
                    setLoadingCount(false);
                    return;
                }

                // workbook.SheetNames.forEach((sheetName) => {
                //     if (sheetName.toLowerCase().includes("tổng")) {

                //     }
                // });
            };
            reader.onerror = (error) => {
                setLoadingCount(false);
                console.log(error);
                setErrText("Upload File lỗi !!!");
            };
            reader.readAsArrayBuffer(file);
        }
    }

    const handleCheck = async () => {
        setLoading(true);
        const resCheck = await fetch("/api/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: serialList }),
        });

        if (resCheck.ok) {
            setLoading(false);
            const result = await resCheck.json();
            setTextRes(result.check);
            setDataRes(result.data);
        } else {
            setLoading(false);
            console.log("[ERROR]:", resCheck.status);
        }
    };

    const copyToClipboard = (textToCopy: string) => {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(textToCopy);
        }
    };
    const copyText = (text: string) => {
        copyToClipboard(text)!.then(() => {
            alert(`Copy text ${text} thành công! `)
        });
    };

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
                <button
                    className="ml-3 px-[20px] py-[10px] bg-blue-500 hover:bg-blue-700 text-white border border-blue-700 rounded"
                    onClick={handleCheck}
                    disabled={loading}
                >
                    Check
                </button>
                <button
                    className="ml-3 px-[20px] py-[10px] border-white border-solid border rounded hover:bg-gray-600"
                    onClick={() => {
                        window.location.reload();
                    }}
                >
                    Refresh
                </button>
            </div>
            <div className="w-full text-center mt-4">
                File đã chọn: {countFile} | Tổng Serial:{" "}
                {serialList.length}{" "}
                {loadingCount ? <span>Đang import ...</span> : <></>}
            </div>
            {loading && <div className="w-[max-content] mx-auto text-center mt-4" style={{ right: "0px" }}>Đang check ...</div>}
            {errText && (
                <div className="w-full text-center mt-4 text-[#ff0000]">{errText}</div>
            )}
            {!loading && textRes && (
                <div
                    className="w-full text-center mt-4"
                    style={dataRes.length != 0 ? { color: "red" } : { color: "#4CAF50" }}
                >
                    {textRes}
                </div>
            )}
            {!loading && dataRes.length != 0 && (
                <div className="w-full text-center mt-3">
                    Serial trùng: {dataRes.length}
                    <div
                        className="overflow-y-auto mt-2"
                        style={{ height: "calc(100dvh - 190px)" }}
                    >
                        {dataRes.map((item: any, idx) => {
                            return (
                                <div
                                    className="w-[70%] border-b-2 border-white py-3 mx-auto mb-2"
                                    key={idx}
                                >
                                    <div className="w-full flex text-left mb-2">
                                        <div className="w-[50%] pl-2">STT: {item.stt}</div>
                                        <div className="w-[50%] pl-2 flex items-start">
                                            Serial: {item.serial}
                                            <span
                                                className="icon pt-[2px] ml-3"
                                                onClick={() => copyText(item.serial)}
                                            >
                                                <FaCopy className="cursor-pointer text-gray-400 font-normal text-base" />
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-full flex text-left">
                                        <div className="w-[50%] pl-2">File: {item.fileName}</div>
                                        <div className="w-[50%] pl-2">Trùng: {item.fileOld}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
