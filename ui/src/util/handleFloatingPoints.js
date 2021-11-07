import Big from 'big.js';

const handleFloatingPoints = (floatToHandle) => {
    if (floatToHandle === '' || isNaN(floatToHandle)) {
      return 0;
    }
    const cleanedNumber = new Big(floatToHandle.toString())
      .toPrecision(5)
      .toString();
    return parseFloat(cleanedNumber);
  };

export default handleFloatingPoints;  