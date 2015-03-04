declare module Iquiz {

    export interface QRating {
        rId: string;
        rQzId: string;
        rNb: string;
        rAvg: number;
        rTotal: string;
    }

    export interface QComment {
        cId: string;
        cQzId: string;
        cUserId: string;
        cUserNickname: string;
        cUserIP: string;
        cDate: string;
        cText: string;
    }

    export interface QQuestion {
        qId: string;
        qQzId: string;
        qPos: string;
        qType: string;
        qDesc: string;
        qExp: string;
        qCorrectAns: string;
        qAllAns: string[];
        qFBlank: string;
        qPic: string;
        qPicSrc: string;
        qVidType: string;
        qVidTitle: string;
        qVid: string;
        qVidSrc: string;
        qAudioType: string;
        qAudioTitle: string;
        qAudio: string;
        qAudioSrc: string;
    }

    export interface Quiz {
        qId: string;
        qUserId: string;
        qStatus: string;
        qImg: string;
        qImgSrc: string;
        qISpeak: string;
        qILearn: string;
        qTitle: string;
        qNormedUrl: string;
        qTeaser: string;
        qDesc: string;
        qAuthor: string;
        qQuest: string;
        qCat: string;
        qCatId: string;
        qParts: string;
        qLevel: string;
        qDate: string;
        qDateChange: string;
        qTags: string;
        qRating: QRating;
        qComments: QComment[];
        qSimilar?: any;
        qQuestions: QQuestion[];
        qAvgScore: string;
        qTotalSocre: string;
    }

}