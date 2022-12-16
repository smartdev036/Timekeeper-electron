const copyToClipboard = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text);
      } catch (error) {
        alert(`Error occured while copying to clipboard. ${error}`);
    }    
}

export default copyToClipboard