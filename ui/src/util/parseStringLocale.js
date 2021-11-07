import { getUserLocale } from 'get-user-locale';
const userLocale = getUserLocale();
// https://stackoverflow.com/questions/11665884/how-can-i-parse-a-string-with-a-comma-thousand-separator-to-a-number
const parseStringLocale = (value, locales = navigator.languages) => {
    if (!value){
        return ''
    }
    const example = Intl.NumberFormat(locales).format('1.1');
    const cleanPattern = new RegExp(`[^-+0-9${example.charAt(1)}]`, 'g');
    const cleaned = value.replace(cleanPattern, '');
    const normalized = cleaned.replace(example.charAt(1), '.');
    return parseFloat(normalized);
  }

export default parseStringLocale;
