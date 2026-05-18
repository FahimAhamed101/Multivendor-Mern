const generatedNumbers = new Set();
export function getTrackingNumber() {
    let randomNum;
    do {
        randomNum = Math.floor(100000 + Math.random() * 900000);
    } while (generatedNumbers.has(randomNum));

    generatedNumbers.add(randomNum);
    return randomNum;
}
