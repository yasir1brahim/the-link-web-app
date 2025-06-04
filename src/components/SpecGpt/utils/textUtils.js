const shortenFilename = (filename, maxCharacters) => {
    const extension = filename.split('.').pop();
    const filenameWithoutExtension = filename.substring(0, filename.length - extension.length - 1);
    if (filename.length > maxCharacters) {
        const ellipsisWithExtension = '...' + extension;
        return filenameWithoutExtension.substring(0, maxCharacters - ellipsisWithExtension.length) + '...' + extension;
    }
    return filename;
}

const shortenString = (stringToShorten, maxCharacters) => {
    if (stringToShorten.length > maxCharacters) {
        return stringToShorten.substring(0, maxCharacters - 3) + '...';
    }
    return stringToShorten;
}

export { shortenFilename, shortenString }