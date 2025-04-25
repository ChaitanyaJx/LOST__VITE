import { useState, useEffect } from "react";
import { Search, Calendar, MapPin, Trash2 } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
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

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;
    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from("LOST_TABLE")
        .delete()
        .eq("id", selectedItem.id);

      if (error) throw error;

      // Close dialogs
      setIsDeleteDialogOpen(false);
      setIsDialogOpen(false);

      // Refresh the lost items list
      fetchLostItems();

      alert("Item successfully deleted!");
    } catch (error) {
      console.error("Error deleting lost item:", error);
      alert("Failed to delete item. Please try again.");
    } finally {
      setIsDeleting(false);
    }
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
    setIsLoading(true); // Set loading to true before fetching
    try {
      const { error, data } = await supabase
        .from("LOST_TABLE")
        .select("*")
        .eq("stillMissing", "searching")
        .order("dateLost", { ascending: false });

      if (error) {
        console.error("Error fetching lost items:", error);
        return;
      }
      setLostItems(data || []);
    } catch (err) {
      console.error("Error with Supabase connection:", err);
    } finally {
      setIsLoading(false); // Set loading to false after fetching
    }
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
      window.location.href = "/signin";
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-start bg-black">
      <header className="py-8 px-8 bg-[#CF0F47] text-white rounded-xl mx-10 my-4">
        <div className="transform transition-transform duration-500 translate-y-0 opacity-100">
          <h1 className="text-5xl text-center font-bold">LOST ITEMS</h1>
        </div>
      </header>

      <div className="px-10 text-white pb-4">
        {/* Search, Filter, and Sort Section */}
        <div className="flex flex-col md:flex-row gap-4 my-8">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by description or location"
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-full md:w-[180px] bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-gray-400 mt-4">Loading lost items...</p>
          </div>
        ) : (
          <>
            {/* Items Count */}
            <div className="mb-6">
              <p className="text-gray-400">
                Showing {filteredAndSortedItems.length}{" "}
                {filteredAndSortedItems.length === 1 ? "item" : "items"}
              </p>
            </div>

            {/* Items List - Compact Cards */}
            <div className="space-y-4">
              {filteredAndSortedItems.map((item) => (
                <Card
                  key={item.id}
                  className="overflow-hidden border-l-4 border-l-blue-500 bg-gray-800 text-white"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {item.itemImageURL && (
                        <div className="flex-shrink-0">
                          <img
                            src={item.itemImageURL}
                            alt={item.description}
                            className="rounded-md object-cover h-16 w-16"
                          />
                        </div>
                      )}
                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium text-base text-white">
                              {item.description}
                            </h3>
                            <p className="text-sm text-gray-300 flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> Lost on{" "}
                              {new Date(item.dateLost).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                          <p className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-gray-300" />
                            <span className="text-gray-300">
                              Location:
                            </span>{" "}
                            <span className="text-white">
                              {item.placeWhereLost}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        <Button variant="secondary" size="sm">
                          Searching
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => handleItemClick(item)}
                          className="text-black border-gray-600 hover:bg-gray-700"
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {filteredAndSortedItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-xl text-gray-400 mb-4">
                  No items found matching your search
                </p>
                <Button
                  variant="outline"
                  className="text-black border-gray-600 hover:bg-gray-700"
                  onClick={() => {
                    setSearchTerm("");
                    setSortOption("newest");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </>
        )}

        {/* Detail Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-gray-800 text-white max-w-md border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-xl text-white">
                {selectedItem?.description}
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                This item is still being searched for
              </DialogDescription>
            </DialogHeader>

            {selectedItem && (
              <div className="space-y-4">
                {selectedItem.itemImageURL && (
                  <div className="flex justify-center">
                    <img
                      src={selectedItem.itemImageURL}
                      alt={selectedItem.description}
                      className="rounded-md object-cover max-h-64 w-auto"
                    />
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="font-medium text-gray-300">Lost On:</span>
                  <span className="col-span-2 text-white">
                    {new Date(selectedItem.dateLost).toLocaleDateString()}
                  </span>
                  <span className="font-medium text-gray-300">Location:</span>
                  <span className="col-span-2 text-white">
                    {selectedItem.placeWhereLost}
                  </span>
                  <span className="font-medium text-gray-300">Owner:</span>
                  <span className="col-span-2 text-white">
                    {selectedItem.personRollno}
                  </span>
                  <span className="font-medium text-gray-300">Contact:</span>
                  <span className="col-span-2 text-white">
                    {selectedItem.PersonContact || "Not provided"}
                  </span>
                </div>
              </div>
            )}

            <DialogFooter className="grid grid-cols-1 grid-rows-2 sm:flex-row gap-2 mt-4">
              <Button
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                onClick={handleFoundItemClick}
              >
                Found This Item
              </Button>
              <Button
                variant="destructive"
                className="w-full sm:w-auto flex items-center gap-2"
                onClick={handleDeleteClick}
              >
                <Trash2 className="h-4 w-4" /> Delete Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent className="bg-gray-800 text-white border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">
                Delete Lost Item Request
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                Are you sure you want to delete this lost item request? This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
              <AlertDialogCancel className="text-black border-gray-600 hover:bg-gray-700">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Found Item Form Dialog */}
        <Dialog open={isFoundFormOpen} onOpenChange={setIsFoundFormOpen}>
          <DialogContent className="bg-gray-800 text-white max-w-md border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-xl text-white">
                Report Found Item
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                Please provide details about finding this item
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleFoundFormSubmit} className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label
                    htmlFor="finderRollNo"
                    className="text-sm font-medium text-gray-300"
                  >
                    Your Roll Number
                  </label>
                  <Input
                    id="finderRollNo"
                    name="finderRollNo"
                    value={foundItemForm.finderRollNo}
                    onChange={handleFoundFormChange}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label
                    htmlFor="placeWhereFound"
                    className="text-sm font-medium text-gray-300"
                  >
                    Where did you find it?
                  </label>
                  <Input
                    id="placeWhereFound"
                    name="placeWhereFound"
                    value={foundItemForm.placeWhereFound}
                    onChange={handleFoundFormChange}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label
                    htmlFor="locationItem"
                    className="text-sm font-medium text-gray-300"
                  >
                    Current Location of Item
                  </label>
                  <Input
                    id="locationItem"
                    name="locationItem"
                    value={foundItemForm.locationItem}
                    onChange={handleFoundFormChange}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label
                    htmlFor="finderContact"
                    className="text-sm font-medium text-gray-300"
                  >
                    Your Contact Number
                  </label>
                  <Input
                    id="finderContact"
                    name="finderContact"
                    value={foundItemForm.finderContact}
                    onChange={handleFoundFormChange}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label
                    htmlFor="dateFound"
                    className="text-sm font-medium text-gray-300"
                  >
                    Date Found
                  </label>
                  <Input
                    id="dateFound"
                    name="dateFound"
                    type="date"
                    value={foundItemForm.dateFound}
                    onChange={handleFoundFormChange}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button
                  type="submit"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto text-white border-gray-600 hover:bg-gray-700"
                  onClick={() => setIsFoundFormOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add New Lost Item Button */}
        <div className="fixed bottom-8 right-8">
          <a href="/founditem" className="inline-block">
            <Button
              size="lg"
              className="rounded-full shadow-lg mx-2 bg-blue-600 hover:bg-blue-700"
            >
              Report Found Items
            </Button>
          </a>
          <Button
            size="lg"
            className="rounded-full shadow-lg cursor-pointer bg-red-600 hover:bg-red-700"
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
