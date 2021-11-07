import { getUserLocale } from 'get-user-locale';

const asLocaleString = (intToLocaleStringify, currencyCode) => {
    if (!intToLocaleStringify) {
      return '';
    }
    const userLocale = getUserLocale();

    return Intl.NumberFormat(userLocale, {
      style: 'currency',
      currency: currencyCode,
      currencyDisplay: 'symbol',
      maximumSignificantDigits: 5,
    }).format(intToLocaleStringify);
  }

export default asLocaleString;  