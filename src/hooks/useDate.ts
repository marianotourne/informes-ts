// export const formatDate = (date: string) =>
//   new Date(date).toLocaleDateString("es-ES", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//   });

export const formatDate = (date: string) => {
  // Si el string es una fecha pura (YYYY-MM-DD), parseala como hora local
  // para evitar el corrimiento de día por UTC.
  const datePart = date.split("T")[0]; // por si viene con hora, nos quedamos con la parte de fecha
  const [year, month, day] = datePart.split("-").map(Number);
  const localDate = new Date(year, month - 1, day);

  return localDate.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};