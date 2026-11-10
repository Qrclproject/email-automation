// src/services/designService.ts

// In-memory store to simulate a database
let designsDb: any[] = [];

export const getDesigns = async () => {
  return { data: { data: designsDb } };
};

export const getDesignById = async (id: string) => {
  const design = designsDb.find(d => d._id === id);
  return { data: { data: design } };
};

export const createDesign = async (formData: FormData) => {
  const name = formData.get('name') as string;
  const imageFile = formData.get('image') as File;
  const dataStr = formData.get('data') as string;
  const parsedData = JSON.parse(dataStr);

  // Convert the uploaded image to a Base64 string so we can display it
  let imageUrl = '';
  if (imageFile) {
    imageUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(imageFile);
    });
  }

  const newDesign = {
    _id: `design_${Date.now()}`,
    name,
    imageUrl,
    ...parsedData
  };

  designsDb.unshift(newDesign); // Add to top of list
  console.log('Mock Save: Created design', newDesign);
  
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network
  return { data: { data: newDesign } };
};

export const updateDesign = async (id: string, data: any) => {
  const index = designsDb.findIndex(d => d._id === id);
  if (index !== -1) {
    designsDb[index] = { ...designsDb[index], ...data };
  }
  await new Promise(resolve => setTimeout(resolve, 500));
  return { data: { data: designsDb[index] } };
};

export const deleteDesign = async (id: string) => {
  designsDb = designsDb.filter(d => d._id !== id);
  return { data: { success: true } };
};