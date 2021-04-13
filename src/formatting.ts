/*
To highlight colors in discord chat messages
we need to use the code formatting highlight.

Because of this, we use this object to get the colors
based on the language that has it implemented on it's
highlight.
*/

const colorText = (text: string, color: string) => {
    const colors: Object = {
        red: `\`\`\`diff\`\`\`
    - ${text}
    `,
        orange: `\`\`\`css
    [${text}]
    \`\`\`
    `,
        yellow: `\`\`\`fix
    ${text}
    \`\`\`
    `,
        green: `\`\`\`diff\`\`\`
    + ${text}
    `,
        lightGreen: `\`\`\`css
    "${text}"
    \`\`\`
    `,
        darkGreen: `\`\`\`bash
    "${text}"
    \`\`\`
    `,
        blue: `\`\`\`ini
    [${text}]
    \`\`\`
    `,

    };

};

const highlightText = (text: string) => {
    return {
        bold: `**${text}**`,
        italic: `*${text}*`,
        underlined: `__${text}__`,
        strikedThrough: `~~${text}~~`,
    };
};


export { colorText, highlightText };