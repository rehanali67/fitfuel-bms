/**
 * Hook to convert numbers to Arabic (Eastern Arabic) numerals
 * Arabic numerals: ٠ ١ ٢ ٣ ٤ ٥ ٦ ٧ ٨ ٩
 */

const ARABIC_NUMERALS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export function useArabicNumbers() {
    /**
     * Converts a number to Arabic numerals
     * @param num - The number to convert
     * @returns String representation with Arabic numerals
     */
    const toArabic = (num: number | string): string => {
        const numStr = typeof num === 'number' ? num.toString() : num;
        return numStr.replace(/\d/g, (digit) => ARABIC_NUMERALS[parseInt(digit)]);
    };

    /**
     * Formats a number with Arabic numerals, preserving decimal separators and formatting
     * @param num - The number to format
     * @param options - Formatting options (decimals, locale, etc.)
     * @returns Formatted string with Arabic numerals
     */
    const formatArabic = (
        num: number,
        options?: {
            decimals?: number;
            useCommas?: boolean;
            currency?: string;
        }
    ): string => {
        const { decimals = 0, useCommas = true, currency } = options || {};
        
        // Format the number with commas if needed
        let formatted = num.toFixed(decimals);
        
        if (useCommas && decimals === 0) {
            formatted = num.toLocaleString('en-US', { maximumFractionDigits: decimals });
        } else if (useCommas) {
            formatted = num.toLocaleString('en-US', { 
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals 
            });
        }
        
        // Convert to Arabic numerals
        const arabicFormatted = toArabic(formatted);
        
        // Add currency prefix if provided
        if (currency) {
            return `${currency} ${arabicFormatted}`;
        }
        
        return arabicFormatted;
    };

    /**
     * Formats currency with Arabic numerals
     * @param num - The amount to format
     * @param currency - Currency symbol (e.g., "QAR")
     * @returns Formatted currency string with Arabic numerals
     */
    const formatCurrency = (num: number, currency: string = 'QAR'): string => {
        return formatArabic(num, {
            decimals: 0,
            useCommas: true,
            currency: currency
        });
    };

    return {
        toArabic,
        formatArabic,
        formatCurrency,
    };
}

