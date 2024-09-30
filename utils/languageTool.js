const axios = require("axios");
const qs = require('qs');

const checkGrammar = async function (text) {
    try {
        const response = await axios({
            method: 'post',
            url: 'https://api.languagetool.org/v2/check',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: qs.stringify({
                text: text,
                language: 'en-US',
            }),
        });

        return response.data;
    } catch (err) {
        console.error('Error checking grammar:', err.response ? err.response.data : err.message);
        return null;
    }
}

const checkGrammarWithGinger = async function (text) {
    const encodedText = encodeURIComponent(text);

    console.log("encodedText", encodedText);

    try {
        const response = await axios.get(`https://services.gingersoftware.com/Ginger/correct/jsonSecured/GingerTheTextFull?text=${encodedText}&lang=US&clientVersion=2.0`);
        console.log("response", response.data);
        const errors = response.data?.Sentences[0]?.Mistakes?.map(mistake => ({
            wrongWord: mistake.Text,
            suggestions: mistake.Suggestions?.map(s => s.Text)
        }));

        return errors.length ? { errors } : { message: 'No spelling errors!' };
    } catch (err) {
        console.error('Error checking grammar with Ginger:', err.message);
        return null;
    }
}

module.exports = { checkGrammar, checkGrammarWithGinger };