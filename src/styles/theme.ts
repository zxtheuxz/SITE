export const themeConfig = {
  light: {
    // Backgrounds
    background: "bg-gradient-to-br from-blue-50 to-indigo-100",
    cardBg: "bg-white",
    inputBg: "bg-white",
    sidebar: "bg-orange-500",
    
    // Borders
    border: "border-gray-300",
    inputBorder: "border-gray-300 focus:border-blue-500",
    
    // Text
    text: "text-gray-800",
    textSecondary: "text-gray-600",
    label: "text-gray-700 font-semibold",
    placeholder: "placeholder-gray-500",
    helperText: "text-gray-500",
    radioLabel: "text-gray-700 ml-2",
    
    // Interactive
    button: "bg-blue-600 hover:bg-blue-700 text-white",
    buttonSecondary: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300",
    input: "w-full rounded-lg px-4 py-2 bg-white border border-orange-300 focus:border-orange-500 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-200 hover:border-orange-400 focus:outline-none",
    select: "w-full rounded-lg px-4 py-2 bg-white border border-orange-300 focus:border-orange-500 text-gray-900 appearance-none focus:ring-2 focus:ring-orange-200 hover:border-orange-400 focus:outline-none",
    radio: "form-radio text-orange-600 border-orange-400 bg-white",
    
    // Effects
    shadow: "shadow-md",
    focusRing: "focus:ring-1 focus:ring-blue-200",
  },
  dark: {
    // Backgrounds
    background: "bg-gradient-to-br from-gray-800 to-gray-900",
    cardBg: "bg-gray-700",
    inputBg: "bg-gray-600",
    sidebar: "bg-orange-600",
    
    // Borders
    border: "border-gray-600",
    inputBorder: "border-gray-500 focus:border-blue-400",
    
    // Text
    text: "text-gray-100",
    textSecondary: "text-gray-300",
    label: "text-gray-200 font-semibold",
    placeholder: "placeholder-gray-300",
    helperText: "text-gray-400",
    radioLabel: "text-gray-200 ml-2",
    
    // Interactive
    button: "bg-blue-600 hover:bg-blue-700 text-white",
    buttonSecondary: "bg-gray-600 hover:bg-gray-500 text-white border border-gray-500",
    input: "w-full rounded-lg px-4 py-2 bg-gray-800 border border-orange-500 focus:border-orange-400 text-white placeholder-gray-300 focus:ring-2 focus:ring-orange-400/50 hover:border-orange-400 focus:outline-none",
    select: "w-full rounded-lg px-4 py-2 bg-gray-800 border border-orange-500 focus:border-orange-400 text-white appearance-none focus:ring-2 focus:ring-orange-400/50 hover:border-orange-400 focus:outline-none",
    radio: "form-radio text-orange-500 border-orange-600 bg-gray-800",
    
    // Effects
    shadow: "shadow-xl",
    focusRing: "focus:ring-1 focus:ring-blue-400",
  }
} as const;

// Hook para usar classes do tema
export const getThemeClass = (isDark: boolean, key: keyof typeof themeConfig.light) => {
  return isDark ? themeConfig.dark[key] : themeConfig.light[key];
}; 