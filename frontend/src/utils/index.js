import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
TimeAgo.addDefaultLocale(en)
const timeAgo = new TimeAgo('en-US')

export const axiosJWTHeader = (jwt) => {
    return {
        Authorization: "Bearer " + jwt
    }
}

export const capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
}

export const validateFixed = (listing) => {
    if (listing.product_id == "0") {
        return "You need to choose a product"
    }
    if (listing.description == "") {
        return "You need to set a description"
    }
    if (listing.base_price == 0) {
        return "You need to set a base price"
    }
    if (listing.quantity == 0) {
        return "You need to set a quantity"
    }
    return undefined
}

export const validateAuction = (listing) => {
    if (listing.product_id == "0") {
        return "You need to choose a product"
    }
    if (listing.description == "") {
        return "You need to set a description"
    }
    if (listing.start_date == "") {
        return "You need to set a start date"
    }
    if (listing.end_date == "") {
        return "You need to set an end date"
    }
    return undefined
}

export const relativeTime = (end) => {
    return capitalize(timeAgo.format(new Date(end)))
}

//Now that server is in central
//https://stackoverflow.com/a/53335889
export function dateToISOLikeButLocal(date) {
    const offsetMs = date.getTimezoneOffset() * 60 * 1000;
    const msLocal = date.getTime() - offsetMs;
    const dateLocal = new Date(msLocal);
    const iso = dateLocal.toISOString();
    const isoLocal = iso.slice(0, 19);
    return isoLocal;
}

export const timeLeft = (end) => {
    var delta = Math.abs(new Date(end) - new Date()) / 1000;

    var days = Math.floor(delta / 86400);
    delta -= days * 86400;

    var hours = Math.floor(delta / 3600) % 24;
    delta -= hours * 3600;

    var minutes = Math.floor(delta / 60) % 60;
    delta -= minutes * 60;

    var seconds = (delta % 60).toFixed(0);

    return `${days} Days ${hours}:${minutes}:${seconds}`
}