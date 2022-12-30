import { ElectronAlert } from "../../DB";

const copyToClipboard = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text);
      } catch (error) {
        ElectronAlert(`Error occured while copying to clipboard. ${error}`);
    }    
}

export default copyToClipboard