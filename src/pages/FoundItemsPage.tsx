import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "./supabase-client";

interface FoundItem {
  id: string;
  finderRollNo: string;
  description: string;
  itemImageURL: string | null;
  placeWhereFound: string;
  locationItem: string;
  finderContact: string;
  dateFound: string;
}

const FOUNDITEMSPAGE = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<FoundItem>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  const fetchFoundItems = async () => {
    setIsLoading(true); // Set loading to true before fetching
    try {
      const { error, data } = await supabase
        .from("FOUND_TABLE")
        .select("*")
        .order("dateFound", { ascending: true });

      if (error) {
        console.error("Error fetching found items:", error);
        return;
      }
      setFoundItems(data || []);
    } catch (err) {
      console.error("Error with Supabase connection:", err);
    } finally {
      setIsLoading(false); // Set loading to false after fetching
    }
  };

  useEffect(() => {
    fetchFoundItems();
  }, []);

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
  ];

  const navigate = useNavigate();

  const handleNavigation = (path: any) => {
    navigate(path);
  };

  // Filter and sort items
  const filteredAndSortedItems = foundItems
    .filter((item) => {
      const matchesSearch =
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.placeWhereFound.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.dateFound).getTime();
      const dateB = new Date(b.dateFound).getTime();

      return sortOption === "newest" ? dateB - dateA : dateA - dateB;
    });

  const filteredItems = filteredAndSortedItems;

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-black ">
      <header className="py-8 px-8 bg-[#CF0F47] text-white rounded-xl mx-10 my-4">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className={`text-5xl text-center font-bold`}>FOUND ITEMS</h1>
        </motion.div>
      </header>

      <div className="min-h-screen px-10 text-white">
        {/* Search and Filter Section */}
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

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-gray-400 mt-4">
              Loading found items Browning...
            </p>
          </div>
        ) : (
          <>
            {/* Items Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {filteredItems.length}{" "}
                {filteredItems.length === 1 ? "item" : "items"}
              </p>
            </div>

            <div className="mb-6">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      to="/"
                      className="text-[#CF0F47] hover:text-[#FF0B55] transition-colors flex items-center"
                    >
                      <ArrowLeft className="h-5 w-5 mr-2" />
                      Back to Home
                    </Link>
                  </TooltipTrigger>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <Card
                  key={item.id}
                  className="flex justify-between overflow-hidden bg-gray-800 text-white border-2"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      {item.description}
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      Found on {new Date(item.dateFound).toLocaleDateString()}
                    </p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {item.itemImageURL && (
                      <img
                        src={item.itemImageURL}
                        alt={item.description}
                        className="rounded-md object-cover h-48 w-full"
                      />
                    )}

                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-xs font-medium text-gray-500">
                          placeWhereFound:
                        </span>
                        <span className="text-xs col-span-2">
                          {item.placeWhereFound}
                        </span>

                        <span className="text-xs font-medium text-gray-500">
                          Finder:
                        </span>
                        <span className="text-xs col-span-2">
                          {item.finderRollNo}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="default"
                      className="w-full"
                      onClick={() => handleItemClick(item)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {filteredItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-xl text-gray-500 mb-4">
                  No items found matching your search
                </p>
                <Button
                  variant="outline"
                  className="text-black"
                  onClick={() => {
                    setSearchTerm("");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-gray-800 text-white border-none">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {selectedItem?.description}
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                Item Details
              </DialogDescription>
            </DialogHeader>

            {selectedItem && (
              <div className="space-y-4">
                {selectedItem.itemImageURL && (
                  <img
                    src={selectedItem.itemImageURL}
                    alt={selectedItem.description}
                    className="rounded-md object-cover h-48 w-full"
                  />
                )}

                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-medium text-gray-400">
                    Found On:
                  </span>
                  <span className="text-sm col-span-2">
                    {new Date(selectedItem.dateFound).toLocaleDateString()}
                  </span>

                  <span className="text-sm font-medium text-gray-400">
                    Where Found:
                  </span>
                  <span className="text-sm col-span-2">
                    {selectedItem.placeWhereFound}
                  </span>

                  <span className="text-sm font-medium text-gray-400">
                    Finder Roll No:
                  </span>
                  <span className="text-sm col-span-2">
                    {selectedItem.finderRollNo}
                  </span>

                  <span className="text-sm font-medium text-gray-400">
                    Finder Contact:
                  </span>
                  <span className="text-sm col-span-2">
                    {selectedItem.finderContact}
                  </span>

                  <span className="text-sm font-medium text-gray-400">
                    Current Location:
                  </span>
                  <span className="text-sm col-span-2">
                    {selectedItem.locationItem}
                  </span>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                className="w-full text-black"
                onClick={() => setIsDialogOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <footer
        className={`py-4 px-8 bg-[#CF0F47] border-t border-[#CF0F47] rounded-xl mx-10 my-4`}
      >
        <div
          className="text-center cursor-pointer"
          onClick={() => handleNavigation("/lostitem")}
        >
          <p className={`text-white text-sm`}>
            Didn't find your lost item? Make a request here
          </p>
        </div>
      </footer>
    </div>
  );
};

export default FOUNDITEMSPAGE;
