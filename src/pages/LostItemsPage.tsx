// Remove unused React import (in React 17+ it's not required)
import { useState, useEffect } from "react";
import { Search, Calendar, MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "./supabase-client";

interface LostItem {
  id: string;
  description: string;
  personRollno: string;
  placeWhereLost: string;
  dateLost: string;
  itemImageURL: string | null;
  PersonContact: string;
  stillMissing: "searching" | "found";
}

interface FoundItemForm {
  finderRollNo: string;
  placeWhereFound: string;
  locationItem: string;
  finderContact: string;
  dateFound: string;
}

const LOSTITEMS = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<LostItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFoundFormOpen, setIsFoundFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [foundItemForm, setFoundItemForm] = useState<FoundItemForm>({
    finderRollNo: "",
    placeWhereFound: "",
    locationItem: "",
    finderContact: "",
    dateFound: new Date().toISOString().split("T")[0],
  });

  const handleItemClick = (item: LostItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleFoundItemClick = () => {
    setIsDialogOpen(false);
    setIsFoundFormOpen(true);
  };

  const handleFoundFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFoundItemForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFoundFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedItem) return;
    setIsSubmitting(true);

    try {
      // Insert into FOUND_TABLE - let Supabase generate the ID
      const { error: insertError } = await supabase.from("FOUND_TABLE").insert({
        // Omit the id field to let Supabase/PostgreSQL auto-generate it
        finderRollNo: foundItemForm.finderRollNo,
        description: selectedItem.description,
        itemImageURL: selectedItem.itemImageURL,
        placeWhereFound: foundItemForm.placeWhereFound,
        locationItem: foundItemForm.locationItem,
        finderContact: foundItemForm.finderContact,
        dateFound: foundItemForm.dateFound,
      });

      if (insertError) throw insertError;

      // Update the status in LOST_TABLE
      const { error: updateError } = await supabase
        .from("LOST_TABLE")
        .update({ stillMissing: "found" })
        .eq("id", selectedItem.id);

      if (updateError) throw updateError;

      // Refresh the lost items list
      fetchLostItems();
      setIsFoundFormOpen(false);

      // Reset form
      setFoundItemForm({
        finderRollNo: "",
        placeWhereFound: "",
        locationItem: "",
        finderContact: "",
        dateFound: new Date().toISOString().split("T")[0],
      });

      alert("Item successfully marked as found!");
    } catch (error) {
      console.error("Error submitting found item:", error);
      alert("Failed to submit found item information. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchLostItems = async () => {
    const { error, data } = await supabase
      .from("LOST_TABLE")
      .select("*")
      .eq("stillMissing", "searching") // Only fetch items still being searched for
      .order("dateLost", { ascending: false });

    if (error) {
      console.error("Error fetching lost items:", error);
      return;
    }
    setLostItems(data || []);
  };

  useEffect(() => {
    fetchLostItems();
  }, []);

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
  ];

  // Filter and sort items
  const filteredAndSortedItems = lostItems
    .filter((item) => {
      const matchesSearch =
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.placeWhereLost.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.dateLost).getTime();
      const dateB = new Date(b.dateLost).getTime();

      return sortOption === "newest" ? dateB - dateA : dateA - dateB;
    });

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // Redirect or update state as needed
    } catch (error) {
      console.error("Error during logout:", error);
      // Handle error gracefully, maybe show a message to the user
    }
  };
  return (
    <div className="min-h-screen flex flex-col justify-start bg-black">
      <header className="py-8 px-8 bg-[#CF0F47] text-white rounded-xl mx-10 my-4">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl text-center font-bold">LOST ITEMS</h1>
        </motion.div>
      </header>

      <div className="px-10 text-white pb-4">
        {/* Search, Filter, and Sort Section */}
        <div className="flex flex-col md:flex-row gap-4 my-8">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-700" />
            <Input
              placeholder="Search by description or location"
              className="pl-10 text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Items Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredAndSortedItems.length}{" "}
            {filteredAndSortedItems.length === 1 ? "item" : "items"}
          </p>
        </div>

        {/* Items List - Compact Cards */}
        <div className="space-y-4">
          {filteredAndSortedItems.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden border-l-4 border-l-blue-500"
            >
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Item Image (if available) */}
                  {item.itemImageURL && (
                    <div className="flex-shrink-0">
                      <img
                        src={item.itemImageURL}
                        alt={item.description}
                        className="rounded-md object-cover h-16 w-16"
                      />
                    </div>
                  )}
                  {/* Item Details */}
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-base">
                          {item.description}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Lost on{" "}
                          {new Date(item.dateLost).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                      <p className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-gray-500" />
                        <span className="text-gray-500">Location:</span>{" "}
                        {item.placeWhereLost}
                      </p>
                    </div>
                  </div>
                  {/* Action Button */}
                  <div className="grid grid-cols-1 gap-1">
                    <Button variant="secondary" size="sm">
                      Searching
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => handleItemClick(item)}
                    >
                      Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detail Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-white text-gray-900 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {selectedItem?.description}
              </DialogTitle>
              <DialogDescription>
                This item is still being searched for
              </DialogDescription>
            </DialogHeader>

            {selectedItem && (
              <div className="space-y-4">
                {/* Item Image */}
                {selectedItem.itemImageURL && (
                  <div className="flex justify-center">
                    <img
                      src={selectedItem.itemImageURL}
                      alt={selectedItem.description}
                      className="rounded-md object-cover max-h-64 w-auto"
                    />
                  </div>
                )}

                {/* Item Details */}
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="font-medium text-gray-700">Lost On:</span>
                  <span className="col-span-2">
                    {new Date(selectedItem.dateLost).toLocaleDateString()}
                  </span>

                  <span className="font-medium text-gray-700">Location:</span>
                  <span className="col-span-2">
                    {selectedItem.placeWhereLost}
                  </span>

                  <span className="font-medium text-gray-700">Owner:</span>
                  <span className="col-span-2">
                    {selectedItem.personRollno}
                  </span>

                  <span className="font-medium text-gray-700">Contact:</span>
                  <span className="col-span-2">
                    {selectedItem.PersonContact || "Not provided"}
                  </span>
                </div>
              </div>
            )}

            <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button
                className="w-full sm:w-auto"
                onClick={handleFoundItemClick}
              >
                Found This Item
              </Button>
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => setIsDialogOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Found Item Form Dialog */}
        <Dialog open={isFoundFormOpen} onOpenChange={setIsFoundFormOpen}>
          <DialogContent className="bg-white text-gray-900 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">Report Found Item</DialogTitle>
              <DialogDescription>
                Please provide details about finding this item
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleFoundFormSubmit} className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label htmlFor="finderRollNo" className="text-sm font-medium">
                    Your Roll Number
                  </label>
                  <Input
                    id="finderRollNo"
                    name="finderRollNo"
                    value={foundItemForm.finderRollNo}
                    onChange={handleFoundFormChange}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <label
                    htmlFor="placeWhereFound"
                    className="text-sm font-medium"
                  >
                    Where did you find it?
                  </label>
                  <Input
                    id="placeWhereFound"
                    name="placeWhereFound"
                    value={foundItemForm.placeWhereFound}
                    onChange={handleFoundFormChange}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="locationItem" className="text-sm font-medium">
                    Current Location of Item
                  </label>
                  <Input
                    id="locationItem"
                    name="locationItem"
                    value={foundItemForm.locationItem}
                    onChange={handleFoundFormChange}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <label
                    htmlFor="finderContact"
                    className="text-sm font-medium"
                  >
                    Your Contact Number
                  </label>
                  <Input
                    id="finderContact"
                    name="finderContact"
                    value={foundItemForm.finderContact}
                    onChange={handleFoundFormChange}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="dateFound" className="text-sm font-medium">
                    Date Found
                  </label>
                  <Input
                    id="dateFound"
                    name="dateFound"
                    type="date"
                    value={foundItemForm.dateFound}
                    onChange={handleFoundFormChange}
                    required
                  />
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setIsFoundFormOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {filteredAndSortedItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-black">
            <p className="text-xl text-gray-500 mb-4">
              No items found matching your search
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSortOption("newest");
              }}
            >
              Clear filters
            </Button>
          </div>
        )}

        {/* Add New Lost Item Button */}
        <div className="fixed bottom-8 right-8">
          <Button size="lg" className="rounded-full shadow-lg mx-2">
            <Link to="/founditem">Report Found Items</Link>
          </Button>
          <Button
            size="lg"
            className="rounded-full shadow-lg cursor-pointer"
            onClick={handleLogout}
          >
            LogOut
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LOSTITEMS;
