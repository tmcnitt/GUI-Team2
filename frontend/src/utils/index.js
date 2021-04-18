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