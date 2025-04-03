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
  useDisclosure
} from "@nextui-org/react";
import { FiEdit, FiTrash2 } from "react-icons/fi";

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

interface Medicine {
  id: string;
  name: string;
  company: string;
  composition: string;
  categoryId: string;
  categoryName?: string;
  subCategoryId: string;
  subCategoryName?: string;
  images_url: string[];
}

export default function MedicinesPage() {
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
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
  
  // State for medicines tab
  const [medicineName, setMedicineName] = useState("");
  const [medicineCompany, setMedicineCompany] = useState("");
  const [medicineComposition, setMedicineComposition] = useState("");
  const [medicineCategory, setMedicineCategory] = useState("");
  const [medicineSubCategory, setMedicineSubCategory] = useState("");
  const [availableSubCategories, setAvailableSubCategories] = useState<SubCategory[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [isEditingMedicine, setIsEditingMedicine] = useState(false);
  
  // Modal control
  const [itemToDelete, setItemToDelete] = useState<{ 
    type: 'category' | 'subcategory' | 'medicine', 
    id: string, 
    parentId?: string 
  }>({ type: 'category', id: '' });

  // Error/success message
  const [message, setMessage] = useState({ type: '', content: '' });

  // Load data when component mounts
  useEffect(() => {
    loadCategories();
    loadAllMedicines();
  }, []);
  
  // Load subcategories when a category is selected for the medicine form
  useEffect(() => {
    if (medicineCategory) {
      loadSubCategoriesForCategory(medicineCategory);
    } else {
      setAvailableSubCategories([]);
    }
  }, [medicineCategory]);

  // Show message helper
  const showMessage = (type: string, content: string) => {
    setMessage({ type, content });
    setTimeout(() => setMessage({ type: '', content: '' }), 3000);
  };

  // Load categories
  const loadCategories = async () => {
    try {
      const fetchedCategories = await firebase.getCategories("medicine");
      setCategories(fetchedCategories);
    } catch (error) {
      showMessage('error', 'Failed to load categories');
    }
  };
  
  // Load subcategories for a specific category
  const loadSubCategoriesForCategory = async (categoryId: string) => {
    try {
      const fetchedSubCategories = await firebase.getSubCategories(categoryId);
      setAvailableSubCategories(fetchedSubCategories as any);
    } catch (error) {
      showMessage('error', 'Failed to load subcategories');
    }
  };
  
  // Load all subcategories (for subcategories tab)
  const loadAllSubCategories = async () => {
    try {
      const fetchedSubCategories = await firebase.getAllSubCategories();
      setSubCategories(fetchedSubCategories as any);
    } catch (error) {
      showMessage('error', 'Failed to load subcategories');
    }
  };
  
  // Load all medicines
  const loadAllMedicines = async () => {
    try {
      const fetchedMedicines = await firebase.getMedicines();
      setMedicines(fetchedMedicines);
    } catch (error) {
      showMessage('error', 'Failed to load medicines');
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
      if (isEditingCategory && selectedCategory) {
        await firebase.updateCategory("medicine", selectedCategory.id, {
          name: categoryName,
          description: categoryDescription
        });
        showMessage('success', 'Category updated successfully');
      } else {
        await firebase.createCategory("medicine", {
          name: categoryName,
          description: categoryDescription
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
      if (isEditingSubCategory && selectedSubCategory) {
        await firebase.updateSubCategory(selectedSubCategory.parentCategoryId, selectedSubCategory.id, {
          name: subCategoryName,
          description: subCategoryDescription
        });
        showMessage('success', 'Subcategory updated successfully');
      } else {
        await firebase.createSubCategory(categoryForSubCategory, {
          name: subCategoryName,
          description: subCategoryDescription
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
  
  // MEDICINE HANDLERS
  
  // Handle medicine form submission
  const handleMedicineSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!medicineName.trim()) {
      showMessage('error', 'Please enter a medicine name');
      return;
    }
    
    if (!medicineCategory || !medicineSubCategory) {
      showMessage('error', 'Please select both a category and subcategory');
      return;
    }
    
    try {
      const medicineData = {
        name: medicineName,
        company: medicineCompany,
        composition: medicineComposition,
        categoryId: medicineCategory,
        subCategoryId: medicineSubCategory,
        images_url: [] // This would need additional functionality for image uploads
      };
      
      if (isEditingMedicine && selectedMedicine) {
        await firebase.updateMedicine(selectedMedicine.id, medicineData);
        showMessage('success', 'Medicine updated successfully');
      } else {
        await firebase.createMedicine(medicineData);
        showMessage('success', 'Medicine created successfully');
      }
      
      // Reset form and reload data
      setMedicineName("");
      setMedicineCompany("");
      setMedicineComposition("");
      setMedicineCategory("");
      setMedicineSubCategory("");
      setIsEditingMedicine(false);
      setSelectedMedicine(null);
      loadAllMedicines();
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to save medicine');
    }
  };
  
  // Edit medicine
  const handleEditMedicine = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setMedicineName(medicine.name);
    setMedicineCompany(medicine.company);
    setMedicineComposition(medicine.composition);
    setMedicineCategory(medicine.categoryId);
    
    // This will trigger the useEffect to load the subcategories
    // Once loaded, we set the subcategory
    setTimeout(() => {
      setMedicineSubCategory(medicine.subCategoryId);
    }, 500);
    
    setIsEditingMedicine(true);
  };
  
  // Prepare to delete medicine
  const handleDeleteMedicine = (medicine: Medicine) => {
    setItemToDelete({ type: 'medicine', id: medicine.id });
    onDeleteModalOpen();
  };
  
  // Handle deletion confirmation
  const handleConfirmDelete = async () => {
    try {
      if (itemToDelete.type === 'category') {
        await firebase.deleteCategory("medicine", itemToDelete.id);
        showMessage('success', 'Category deleted successfully');
        loadCategories();
      } else if (itemToDelete.type === 'subcategory' && itemToDelete.parentId) {
        await firebase.deleteSubCategory(itemToDelete.parentId, itemToDelete.id);
        showMessage('success', 'Subcategory deleted successfully');
        loadAllSubCategories();
      } else if (itemToDelete.type === 'medicine') {
        await firebase.deleteMedicine(itemToDelete.id);
        showMessage('success', 'Medicine deleted successfully');
        loadAllMedicines();
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

  return (
    <div className="px-4 py-5">
      <h1 className="text-2xl font-bold mb-6">Medicines Management</h1>
      
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
                    <Button type="submit" color="primary">
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
                    <Button type="submit" color="primary">
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
        
        <Tab key="2" title="Medicines">
          <div className="mt-4 space-y-8">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">
                  {isEditingMedicine ? "Edit Medicine" : "Add New Medicine"}
                </h2>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleMedicineSubmit} className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium">Medicine Name*</label>
                    <Input
                      value={medicineName}
                      onChange={(e) => setMedicineName(e.target.value)}
                      placeholder="Enter medicine name"
                      isRequired
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium">Company*</label>
                    <Input
                      value={medicineCompany}
                      onChange={(e) => setMedicineCompany(e.target.value)}
                      placeholder="Enter company name"
                      isRequired
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium">Composition*</label>
                    <Textarea
                      value={medicineComposition}
                      onChange={(e) => setMedicineComposition(e.target.value)}
                      placeholder="Enter medicine composition"
                      isRequired
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium">Category*</label>
                    <Select
                      placeholder="Select category"
                      selectedKeys={medicineCategory ? [medicineCategory] : []}
                      onChange={(e) => {
                        setMedicineCategory(e.target.value);
                        setMedicineSubCategory("");
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
                      selectedKeys={medicineSubCategory ? [medicineSubCategory] : []}
                      onChange={(e) => setMedicineSubCategory(e.target.value)}
                      isDisabled={!medicineCategory}
                      isRequired
                    >
                      {availableSubCategories.map((subCat) => (
                        <SelectItem key={subCat.id} value={subCat.id}>
                          {subCat.name}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button type="submit" color="primary">
                      {isEditingMedicine ? "Update Medicine" : "Add Medicine"}
                    </Button>
                    {isEditingMedicine && (
                      <Button
                        variant="light"
                        onClick={() => {
                          setIsEditingMedicine(false);
                          setSelectedMedicine(null);
                          setMedicineName("");
                          setMedicineCompany("");
                          setMedicineComposition("");
                          setMedicineCategory("");
                          setMedicineSubCategory("");
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
                <h2 className="text-xl font-semibold">Medicines List</h2>
              </CardHeader>
              <CardBody>
                <Table aria-label="Medicines table">
                  <TableHeader>
                    <TableColumn>NAME</TableColumn>
                    <TableColumn>COMPANY</TableColumn>
                    <TableColumn>CATEGORY</TableColumn>
                    <TableColumn>SUBCATEGORY</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {medicines.map((medicine) => (
                      <TableRow key={medicine.id}>
                        <TableCell>{medicine.name}</TableCell>
                        <TableCell>{medicine.company}</TableCell>
                        <TableCell>{medicine.categoryName}</TableCell>
                        <TableCell>{medicine.subCategoryName}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onClick={() => handleEditMedicine(medicine)}
                            >
                              <FiEdit />
                            </Button>
                            <Button
                              isIconOnly
                              size="sm"
                              color="danger"
                              variant="light"
                              onClick={() => handleDeleteMedicine(medicine)}
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
