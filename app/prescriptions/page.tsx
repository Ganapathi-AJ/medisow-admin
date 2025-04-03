"use client";

import { useState, useEffect, FormEvent } from "react";
import { useFirebase } from "../context/firebase-context";
import { 
  Button, 
  Input, 
  Textarea,
  Select,
  SelectItem,
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell, 
  Card, 
  CardBody, 
  CardHeader,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Tabs,
  Tab,
  Divider,
  useDisclosure,
  Image
} from "@nextui-org/react";
import { FiEdit, FiTrash2, FiPlus, FiUpload } from "react-icons/fi";

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface SubCategory {
  id: string;
  name: string;
  description?: string;
  parentCategoryId: string;
  parentCategoryName?: string;
}

interface Prescription {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  subCategoryId: string;
  subCategoryName?: string;
  images_url: string[];
}

export default function PrescriptionsPage() {
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
  const { isOpen: isUploadOpen, onOpen: onUploadOpen, onClose: onUploadClose } = useDisclosure();
  const firebase = useFirebase();
  
  // State for categories tab
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  
  // State for subcategories tab
  const [subCategoryName, setSubCategoryName] = useState("");
  const [subCategoryDescription, setSubCategoryDescription] = useState("");
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
  const [isEditingSubCategory, setIsEditingSubCategory] = useState(false);
  const [categoryForSubCategory, setCategoryForSubCategory] = useState("");
  
  // State for prescriptions tab
  const [prescriptionTitle, setPrescriptionTitle] = useState("");
  const [prescriptionDescription, setPrescriptionDescription] = useState("");
  const [prescriptionCategory, setPrescriptionCategory] = useState("");
  const [prescriptionSubCategory, setPrescriptionSubCategory] = useState("");
  const [prescriptionImages, setPrescriptionImages] = useState<File[]>([]);
  const [prescriptionImagePreviews, setPrescriptionImagePreviews] = useState<string[]>([]);
  const [availableSubCategories, setAvailableSubCategories] = useState<SubCategory[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isEditingPrescription, setIsEditingPrescription] = useState(false);
  
  // Modal control
  const [itemToDelete, setItemToDelete] = useState<{ 
    type: 'category' | 'subcategory' | 'prescription', 
    id: string, 
    parentId?: string 
  }>({ type: 'category', id: '' });

  // Error/success message
  const [message, setMessage] = useState({ type: '', content: '' });
  const [isUploading, setIsUploading] = useState(false);

  // Load data when component mounts
  useEffect(() => {
    loadCategories();
    loadAllPrescriptions();
  }, []);
  
  // Load subcategories when a category is selected for the prescription form
  useEffect(() => {
    if (prescriptionCategory) {
      loadSubCategoriesForCategory(prescriptionCategory);
    } else {
      setAvailableSubCategories([]);
    }
  }, [prescriptionCategory]);

  // Show message helper
  const showMessage = (type: string, content: string) => {
    setMessage({ type, content });
    setTimeout(() => setMessage({ type: '', content: '' }), 3000);
  };

  // Load categories
  const loadCategories = async () => {
    try {
      const fetchedCategories = await firebase.getCategories("prescription");
      setCategories(fetchedCategories);
    } catch (error) {
      showMessage('error', 'Failed to load categories');
    }
  };
  
  // Load subcategories for a specific category
  const loadSubCategoriesForCategory = async (categoryId: string) => {
    try {
      const fetchedSubCategories = await firebase.getSubCategories(categoryId);
      // Ensure the data matches our interface
      const typedSubCategories: SubCategory[] = fetchedSubCategories.map((subCat: any) => ({
        ...subCat,
        parentCategoryId: subCat.parentCategoryId || categoryId
      }));
      setAvailableSubCategories(typedSubCategories);
    } catch (error) {
      showMessage('error', 'Failed to load subcategories');
    }
  };
  
  // Load all subcategories (for subcategories tab)
  const loadAllSubCategories = async () => {
    try {
      const fetchedSubCategories = await firebase.getAllSubCategories(); 
      // Filter to include only subcategories related to prescription categories
      const typedSubCategories: SubCategory[] = fetchedSubCategories
        .filter((subCategory: any) => 
          categories.some(category => category.id === subCategory.parentCategoryId)
        )
        .map((subCat: any) => ({
          ...subCat,
          parentCategoryId: subCat.parentCategoryId
        }));
      setSubCategories(typedSubCategories);
    } catch (error) {
      showMessage('error', 'Failed to load subcategories');
    }
  };
  
  // Load all prescriptions
  const loadAllPrescriptions = async () => {
    try {
      const fetchedPrescriptions = await firebase.getPrescriptions();
      // Ensure the data matches our interface
      const typedPrescriptions: Prescription[] = fetchedPrescriptions.map((prescription: any) => ({
        ...prescription,
        categoryId: prescription.categoryId || '',
        subCategoryId: prescription.subCategoryId || '',
        images_url: prescription.images_url || []
      }));
      setPrescriptions(typedPrescriptions);
    } catch (error) {
      showMessage('error', 'Failed to load prescriptions');
    }
  };

  // Handle file selection for images
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'prescription') => {
    const files = e.target.files;
    if (!files) return;

    if (type === 'prescription') {
      const newFiles = Array.from(files);
      setPrescriptionImages(prev => [...prev, ...newFiles]);
      
      const newPreviews = Array.from(files).map(file => URL.createObjectURL(file));
      setPrescriptionImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const uploadImage = async (file: File, path: string): Promise<string> => {
    try {
      return await firebase.uploadImage(file, path);
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };
  
  // CATEGORY HANDLERS
  
  // Handle category form submission
  const handleCategorySubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!categoryName.trim()) {
      showMessage('error', 'Please enter a category name');
      return;
    }
    
    try {
      setIsUploading(true);
      
      if (isEditingCategory && selectedCategory) {
        await firebase.updateCategory("prescription", selectedCategory.id, {
          name: categoryName,
          description: categoryDescription,
        });
        showMessage('success', 'Category updated successfully');
      } else {
        await firebase.createCategory("prescription", {
          name: categoryName,
          description: categoryDescription,
        });
        showMessage('success', 'Category created successfully');
      }
      
      // Reset form and reload data
      setCategoryName("");
      setCategoryDescription("");
      setIsEditingCategory(false);
      setSelectedCategory(null);
      loadCategories();
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to save category');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Edit category
  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description || "");
    setIsEditingCategory(true);
  };
  
  // Prepare to delete category
  const handleDeleteCategory = (category: Category) => {
    setItemToDelete({ type: 'category', id: category.id });
    onDeleteModalOpen();
  };
  
  // SUBCATEGORY HANDLERS
  
  // Handle subcategory form submission
  const handleSubCategorySubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!categoryForSubCategory) {
      showMessage('error', 'Please select a parent category');
      return;
    }
    
    if (!subCategoryName.trim()) {
      showMessage('error', 'Please enter a subcategory name');
      return;
    }
    
    try {
      setIsUploading(true);
      
      if (isEditingSubCategory && selectedSubCategory) {
        await firebase.updateSubCategory(selectedSubCategory.parentCategoryId, selectedSubCategory.id, {
          name: subCategoryName,
          description: subCategoryDescription,
        });
        showMessage('success', 'Subcategory updated successfully');
      } else {
        await firebase.createSubCategory(categoryForSubCategory, {
          name: subCategoryName,
          description: subCategoryDescription,
        });
        showMessage('success', 'Subcategory created successfully');
      }
      
      // Reset form and reload data
      setSubCategoryName("");
      setSubCategoryDescription("");
      setCategoryForSubCategory("");
      setIsEditingSubCategory(false);
      setSelectedSubCategory(null);
      loadAllSubCategories();
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to save subcategory');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Edit subcategory
  const handleEditSubCategory = (subCategory: SubCategory) => {
    setSelectedSubCategory(subCategory);
    setSubCategoryName(subCategory.name);
    setSubCategoryDescription(subCategory.description || "");
    setCategoryForSubCategory(subCategory.parentCategoryId);
    setIsEditingSubCategory(true);
  };
  
  // Prepare to delete subcategory
  const handleDeleteSubCategory = (subCategory: SubCategory) => {
    setItemToDelete({ 
      type: 'subcategory', 
      id: subCategory.id, 
      parentId: subCategory.parentCategoryId 
    });
    onDeleteModalOpen();
  };
  
  // PRESCRIPTION HANDLERS
  
  // Handle prescription form submission
  const handlePrescriptionSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!prescriptionTitle.trim()) {
      showMessage('error', 'Please enter a prescription title');
      return;
    }
    
    if (!prescriptionCategory || !prescriptionSubCategory) {
      showMessage('error', 'Please select both a category and subcategory');
      return;
    }
    
    try {
      setIsUploading(true);
      let imageUrls: string[] = [];
      
      // Upload any new images
      if (prescriptionImages.length > 0) {
        const uploadPromises = prescriptionImages.map(file => 
          uploadImage(file, "prescriptions")
        );
        imageUrls = await Promise.all(uploadPromises);
      }
      
      // Keep existing images if editing
      if (isEditingPrescription && selectedPrescription) {
        imageUrls = [...selectedPrescription.images_url, ...imageUrls];
      }
      
      const prescriptionData = {
        title: prescriptionTitle,
        description: prescriptionDescription,
        categoryId: prescriptionCategory,
        subCategoryId: prescriptionSubCategory,
        images_url: imageUrls
      };
      
      if (isEditingPrescription && selectedPrescription) {
        await firebase.updatePrescription(selectedPrescription.id, prescriptionData);
        showMessage('success', 'Prescription updated successfully');
      } else {
        await firebase.createPrescription(prescriptionData);
        showMessage('success', 'Prescription created successfully');
      }
      
      // Reset form and reload data
      setPrescriptionTitle("");
      setPrescriptionDescription("");
      setPrescriptionCategory("");
      setPrescriptionSubCategory("");
      setPrescriptionImages([]);
      setPrescriptionImagePreviews([]);
      setIsEditingPrescription(false);
      setSelectedPrescription(null);
      loadAllPrescriptions();
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to save prescription');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Edit prescription
  const handleEditPrescription = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setPrescriptionTitle(prescription.title);
    setPrescriptionDescription(prescription.description);
    setPrescriptionCategory(prescription.categoryId);
    
    // This will trigger the useEffect to load the subcategories
    // Once loaded, we set the subcategory
    setTimeout(() => {
      setPrescriptionSubCategory(prescription.subCategoryId);
    }, 500);
    
    setPrescriptionImagePreviews(prescription.images_url);
    setPrescriptionImages([]);
    setIsEditingPrescription(true);
  };
  
  // Prepare to delete prescription
  const handleDeletePrescription = (prescription: Prescription) => {
    setItemToDelete({ type: 'prescription', id: prescription.id });
    onDeleteModalOpen();
  };
  
  // Handle deletion confirmation
  const handleConfirmDelete = async () => {
    try {
      if (itemToDelete.type === 'category') {
        await firebase.deleteCategory("prescription", itemToDelete.id);
        showMessage('success', 'Category deleted successfully');
        loadCategories();
        loadAllSubCategories();
      } else if (itemToDelete.type === 'subcategory' && itemToDelete.parentId) {
        await firebase.deleteSubCategory(itemToDelete.parentId, itemToDelete.id);
        showMessage('success', 'Subcategory deleted successfully');
        loadAllSubCategories();
      } else if (itemToDelete.type === 'prescription') {
        await firebase.deletePrescription(itemToDelete.id);
        showMessage('success', 'Prescription deleted successfully');
        loadAllPrescriptions();
      }
    } catch (error: any) {
      showMessage('error', error.message || `Failed to delete ${itemToDelete.type}`);
    } finally {
      onDeleteModalClose();
    }
  };
  
  // Load subcategories when the subcategories tab is selected
  const handleTabChange = (key: string | number) => {
    if (key === "1") { // Subcategories tab
      loadAllSubCategories();
    }
  };

  // Remove prescription image preview
  const removePrescriptionImage = (index: number) => {
    setPrescriptionImagePreviews(prev => prev.filter((_, i) => i !== index));
    setPrescriptionImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="px-4 py-5">
      <h1 className="text-2xl font-bold mb-6">Prescriptions Management</h1>
      
      {message.content && (
        <div className={`p-3 mb-4 rounded ${message.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          {message.content}
        </div>
      )}
      
      <Tabs onSelectionChange={handleTabChange}>
        <Tab key="0" title="Categories">
          <div className="mt-4 space-y-8">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">
                  {isEditingCategory ? "Edit Category" : "Add New Category"}
                </h2>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium">Category Name*</label>
                    <Input
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      placeholder="Enter category name"
                      isRequired
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium">Description</label>
                    <Textarea
                      value={categoryDescription}
                      onChange={(e) => setCategoryDescription(e.target.value)}
                      placeholder="Enter category description"
                    />
                  </div>
                  
                  <div className="flex justify-between">
                    <Button type="submit" color="primary" isLoading={isUploading}>
                      {isEditingCategory ? "Update Category" : "Add Category"}
                    </Button>
                    {isEditingCategory && (
                      <Button
                        variant="light"
                        onClick={() => {
                          setIsEditingCategory(false);
                          setSelectedCategory(null);
                          setCategoryName("");
                          setCategoryDescription("");
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardBody>
            </Card>
            
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Categories List</h2>
              </CardHeader>
              <CardBody>
                <Table aria-label="Categories table">
                  <TableHeader>
                    <TableColumn>NAME</TableColumn>
                    <TableColumn>DESCRIPTION</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>{category.name}</TableCell>
                        <TableCell>{category.description}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onClick={() => handleEditCategory(category)}
                            >
                              <FiEdit />
                            </Button>
                            <Button
                              isIconOnly
                              size="sm"
                              color="danger"
                              variant="light"
                              onClick={() => handleDeleteCategory(category)}
                            >
                              <FiTrash2 />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </div>
        </Tab>
        
        <Tab key="1" title="Subcategories">
          <div className="mt-4 space-y-8">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">
                  {isEditingSubCategory ? "Edit Subcategory" : "Add New Subcategory"}
                </h2>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleSubCategorySubmit} className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium">Parent Category*</label>
                    <Select
                      placeholder="Select parent category"
                      selectedKeys={categoryForSubCategory ? [categoryForSubCategory] : []}
                      onChange={(e) => setCategoryForSubCategory(e.target.value)}
                      isRequired
                    >
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium">Subcategory Name*</label>
                    <Input
                      value={subCategoryName}
                      onChange={(e) => setSubCategoryName(e.target.value)}
                      placeholder="Enter subcategory name"
                      isRequired
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium">Description</label>
                    <Textarea
                      value={subCategoryDescription}
                      onChange={(e) => setSubCategoryDescription(e.target.value)}
                      placeholder="Enter subcategory description"
                    />
                  </div>
                  
                  <div className="flex justify-between">
                    <Button type="submit" color="primary" isLoading={isUploading}>
                      {isEditingSubCategory ? "Update Subcategory" : "Add Subcategory"}
                    </Button>
                    {isEditingSubCategory && (
                      <Button
                        variant="light"
                        onClick={() => {
                          setIsEditingSubCategory(false);
                          setSelectedSubCategory(null);
                          setSubCategoryName("");
                          setSubCategoryDescription("");
                          setCategoryForSubCategory("");
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardBody>
            </Card>
            
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Subcategories List</h2>
              </CardHeader>
              <CardBody>
                <Table aria-label="Subcategories table">
                  <TableHeader>
                    <TableColumn>NAME</TableColumn>
                    <TableColumn>PARENT CATEGORY</TableColumn>
                    <TableColumn>DESCRIPTION</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {subCategories.map((subCategory) => (
                      <TableRow key={subCategory.id}>
                        <TableCell>{subCategory.name}</TableCell>
                        <TableCell>{subCategory.parentCategoryName}</TableCell>
                        <TableCell>{subCategory.description}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onClick={() => handleEditSubCategory(subCategory)}
                            >
                              <FiEdit />
                            </Button>
                            <Button
                              isIconOnly
                              size="sm"
                              color="danger"
                              variant="light"
                              onClick={() => handleDeleteSubCategory(subCategory)}
                            >
                              <FiTrash2 />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </div>
        </Tab>
        
        <Tab key="2" title="Prescriptions">
          <div className="mt-4 space-y-8">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">
                  {isEditingPrescription ? "Edit Prescription" : "Add New Prescription"}
                </h2>
              </CardHeader>
              <CardBody>
                <form onSubmit={handlePrescriptionSubmit} className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium">Prescription Title*</label>
                    <Input
                      value={prescriptionTitle}
                      onChange={(e) => setPrescriptionTitle(e.target.value)}
                      placeholder="Enter prescription title"
                      isRequired
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium">Description*</label>
                    <Textarea
                      value={prescriptionDescription}
                      onChange={(e) => setPrescriptionDescription(e.target.value)}
                      placeholder="Enter prescription description"
                      isRequired
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium">Category*</label>
                    <Select
                      placeholder="Select category"
                      selectedKeys={prescriptionCategory ? [prescriptionCategory] : []}
                      onChange={(e) => {
                        setPrescriptionCategory(e.target.value);
                        setPrescriptionSubCategory("");
                      }}
                      isRequired
                    >
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium">Subcategory*</label>
                    <Select
                      placeholder="Select subcategory"
                      selectedKeys={prescriptionSubCategory ? [prescriptionSubCategory] : []}
                      onChange={(e) => setPrescriptionSubCategory(e.target.value)}
                      isDisabled={!prescriptionCategory}
                      isRequired
                    >
                      {availableSubCategories.map((subCat) => (
                        <SelectItem key={subCat.id} value={subCat.id}>
                          {subCat.name}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">Prescription Images</label>
                    <div className="flex flex-col gap-4">
                      <Button 
                        color="primary" 
                        variant="flat" 
                        onClick={() => document.getElementById("prescriptionImages")?.click()}
                      >
                        <FiUpload className="mr-1" /> Upload Images
                      </Button>
                      <input
                        id="prescriptionImages"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => handleImageSelect(e, 'prescription')}
                      />
                      
                      {prescriptionImagePreviews.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {prescriptionImagePreviews.map((preview, index) => (
                            <div key={index} className="relative w-24 h-24">
                              <img 
                                src={preview} 
                                alt={`Preview ${index}`} 
                                className="object-cover w-full h-full rounded"
                              />
                              <Button
                                isIconOnly
                                size="sm"
                                color="danger"
                                variant="flat"
                                radius="full"
                                className="absolute -top-2 -right-2"
                                onClick={() => removePrescriptionImage(index)}
                              >
                                <FiTrash2 size={12} />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button type="submit" color="primary" isLoading={isUploading}>
                      {isEditingPrescription ? "Update Prescription" : "Add Prescription"}
                    </Button>
                    {isEditingPrescription && (
                      <Button
                        variant="light"
                        onClick={() => {
                          setIsEditingPrescription(false);
                          setSelectedPrescription(null);
                          setPrescriptionTitle("");
                          setPrescriptionDescription("");
                          setPrescriptionCategory("");
                          setPrescriptionSubCategory("");
                          setPrescriptionImages([]);
                          setPrescriptionImagePreviews([]);
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardBody>
            </Card>
            
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Prescriptions List</h2>
              </CardHeader>
              <CardBody>
                <Table aria-label="Prescriptions table">
                  <TableHeader>
                    <TableColumn>TITLE</TableColumn>
                    <TableColumn>DESCRIPTION</TableColumn>
                    <TableColumn>CATEGORY</TableColumn>
                    <TableColumn>SUBCATEGORY</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {prescriptions.map((prescription) => (
                      <TableRow key={prescription.id}>
                        <TableCell>{prescription.title}</TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">
                            {prescription.description}
                          </div>
                        </TableCell>
                        <TableCell>{prescription.categoryName}</TableCell>
                        <TableCell>{prescription.subCategoryName}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onClick={() => handleEditPrescription(prescription)}
                            >
                              <FiEdit />
                            </Button>
                            <Button
                              isIconOnly
                              size="sm"
                              color="danger"
                              variant="light"
                              onClick={() => handleDeletePrescription(prescription)}
                            >
                              <FiTrash2 />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </div>
        </Tab>
      </Tabs>
      
      {/* Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalBody>
            Are you sure you want to delete this {itemToDelete.type}? This action cannot be undone.
          </ModalBody>
          <ModalFooter>
            <Button color="danger" onClick={handleConfirmDelete}>
              Delete
            </Button>
            <Button variant="light" onClick={onDeleteModalClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
} 