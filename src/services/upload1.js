export const uploadImage = async (file) => {
  if (!file) {
    throw new Error("Nenhum arquivo enviado");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "igreja");

  try {
    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dsqguwcj8/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    console.log("CLOUDINARY RESPONSE:", data);

    if (!res.ok) {
      throw new Error(data?.error?.message || "Erro no upload");
    }

    if (!data.secure_url) {
      throw new Error("URL não retornada");
    }

    return data.secure_url;
  } catch (error) {
    console.error("Erro ao enviar imagem:", error);
    throw error;
  }
};