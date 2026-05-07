export const formatData = (data:string) => {
    const dateFormat = (new Date(data)).toLocaleString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    })
    return dateFormat
}