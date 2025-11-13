import { supabase } from "../services/supabase/supabaseClient";

async function uploadImage(file, chatId) {
  try {
    const fileName = `${chatId}/${Date.now()}_${file.name}`;

    // Upload to the public bucket
    const { error } = await supabase.storage
      .from("chat_images")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });

    if (error) throw error;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("chat_images").getPublicUrl(fileName);

    return publicUrl;
  } catch (err) {
    console.error("Upload failed:", err.message);
    throw err;
  }
}

export default uploadImage;
