export default function DownloadButton({ audioBlob }) {
    const handleDownload = () => {
        const url = URL.createObjectURL(audioBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'modified-audio.wav'; // Change the file name and extension as needed
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <button onClick={handleDownload}>
            Download Modified Audio
        </button>
    );
}