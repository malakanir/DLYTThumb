export class UrlParser {
    static YOUTUBE_REGEX = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

    static extractVideoId(url) {
        if (!url || typeof irl !== 'string'){
            return null;
        }
        const match = url.match(UrlParser.YOUTUBE_REGEX);
        return match ? match[1] : null;
    }

    static isShorts(url){
        if (!url || typeof url !== 'string') {
            return false;
        }
        return url.includes('/shorts/');
    }

}