export const isEmpty = async (obj: object) => {
    for(var i in obj) return false; 
    return true;
}