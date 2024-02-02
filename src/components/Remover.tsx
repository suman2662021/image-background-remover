import React, { useState, useRef } from "react";
import axios from 'axios';
import { FaFileDownload, FaCamera } from "react-icons/fa";

const Remover: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [finalUrl, setFinalUrl] = useState<string | null>(null);
    const [isUpload, setIsUpload] = useState<boolean>(false);
    const [capturedImage, setCapturedImage] = useState<File | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [error, setError] = useState('')


    const handleFileInputChange = (file: File | null) => {
        setSelectedFile(file);
    };

    const handleCaptureClick = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
    
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play();
                    const canvas = document.createElement("canvas");
    
                    if (videoRef.current?.videoWidth && videoRef.current?.videoHeight) {
                        canvas.width = videoRef.current.videoWidth;
                        canvas.height = videoRef.current.videoHeight;
    
                        const context = canvas.getContext("2d");
                        if (context) {
                            if (videoRef.current) {
                                context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                                const capturedImageUrl = canvas.toDataURL("image/png");

                                const file = dataURItoBlob(capturedImageUrl, 'capture.png');
                                // Set both selectedFile and capturedImage
                                setCapturedImage(file);
                                setSelectedFile(file);
                            }
                        }
                    }
                    stream.getTracks().forEach(track => track.stop());
                };
            }
        } catch (error) {
            console.error("Error accessing camera:", error);
        }
    };
    
    // Convert data URI to Blob
    const dataURItoBlob = (dataURI: string, fileName: string): File => {
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uint8Array = new Uint8Array(arrayBuffer);
    
        for (let i = 0; i < byteString.length; i++) {
            uint8Array[i] = byteString.charCodeAt(i);
        }
    
        const blob = new Blob([arrayBuffer], { type: mimeString });
    
        // Create a File object
        const file = new File([blob], fileName, { lastModified: Date.now(), type: blob.type });
    
        return file;
    };
    

    const handleFileUpload = async () => {
        setIsUpload(true);

        // Check if a file is selected
        if (!selectedFile) {
            console.error("No file selected");
            setIsUpload(false);
            setError("No file selected");
            return;
        }
    
        // Check if the selected file is an image
        if (!selectedFile.type.startsWith('image/')) {
            console.error("Selected file is not an image");
            setIsUpload(false);
            setError("Selected file is not an image");
            return;
        }


        const formData = new FormData();
        formData.append("image_file", selectedFile!);
        formData.append("size", "auto");

        const api_key = "ZLmRs73cZn38cbqHVofuXhU1";

        // send to the server
        try {
            const response = await axios.post("https://api.remove.bg/v1.0/removebg", formData, {
                headers: {
                    "X-Api-Key": api_key,
                },
                responseType: 'blob', // Specify the response type as blob
            });

            const url = URL.createObjectURL(response.data);
            setFinalUrl(url);
        } catch (error) {
            console.error("Error uploading file:", error);
            setError("Unable to upload the image");
        } finally {
            setIsUpload(false);
        }
    };

    return (
        <div className="background w-screen h-screen ">
            <div className="remover_container text-slate-100 flex justify-evenly items-center flex-col w-screen h-screen md:flex-col lg:flex-col">
                <div className="title">
                    <h4 className="lg:text-5xl text-3xl">Remove Background <span className=" inline-block">for 100% free</span> </h4>
                </div>
                {error !== '' ? <p>{error}</p> : null}
                <div className="flex justify-center items-center flex-col h-1/2">
                    <form className="info_container flex justify-between  flex-col h-1/6 w-fit ">
                        <label htmlFor="userImg" className="info_text">Select a File</label>
                        <input
                            type="file"
                            id="userImg"
                            className="pb-7"
                            onChange={(e) => handleFileInputChange(e.target.files?.[0] || null)}
                            capture="user"
                            accept="image/*"
                            required
                        />
                        <button
                            type="button"
                            onClick={handleCaptureClick}
                            className="bg-blue-600 p-2 rounded mt-2"
                        >
                            <FaCamera /> Capture
                        </button>
                        {!isUpload ? (
                            <button
                                type="button"
                                onClick={handleFileUpload}
                                className="bg-purple-600 p-2 rounded mt-2"
                            >
                                Upload
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="bg-purple-300 p-2 rounded mt-2"
                                disabled={true}
                            >
                                Uploading...
                            </button>
                        )}
                    </form>
                    <div className="flex justify-center items-center flex-col mt-8 p-4" style={{ marginTop: '15%' }}>
                        {/* {selectedFile && (
                            <div className="selected_img_area w-fit grid place-items-center mb-2">
                                <img src={URL.createObjectURL(selectedFile)} alt="selected_img" className="w-2/6 h-auto" />
                            </div>
                        )} */}
                        {capturedImage && (
                            <div className="selected_img_area w-fit grid place-items-center mb-2">
                                <img src={URL.createObjectURL(capturedImage)} alt="captured_img" className="w-2/6 h-auto" />
                            </div>
                        )}
                        {finalUrl && (
                            <div className="final_img_area w-fit grid place-items-center mb-2">
                                <img src={finalUrl} alt="final_img" className="w-2/6 h-auto" />
                            </div>
                        )}
                        {finalUrl && (
                            <a href={finalUrl} download="Removed Background.png" >
                                <button className="bg-purple-600 p-2 rounded flex items-center m-1 w-full">Download <div className="px-2"><FaFileDownload /></div> </button>
                            </a>
                        )}
                    </div>
                </div>
            </div>
            <video ref={videoRef} className="hidden"></video>
        </div>
    );
};

export default Remover;
