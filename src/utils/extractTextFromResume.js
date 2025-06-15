import pdfParse from "pdf-parse";
import mammoth from "mammoth";

const extractTextFromResume = async (fileBuffer, fileType) => {

  if (process.env.NODE_ENV !== 'production') {
  const fs = require('fs');
  const pdfParse = require('pdf-parse');
  const dataBuffer = fs.readFileSync('./test/data/05-versions-space.pdf');
  pdfParse(dataBuffer).then(data => console.log(data.text));
}

  try {
    if (fileType === "application/pdf") {
      const pdfData = await pdfParse(fileBuffer); // ✅ Use Buffer directly
      return pdfData.text;
    } else if (
      fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const docxData = await mammoth.extractRawText({ buffer: fileBuffer });
      return docxData.value;
    }
    return null;
  } catch (error) {
    console.error("❌ Error extracting text:", error);
    return null;
  }
};

export default extractTextFromResume;
