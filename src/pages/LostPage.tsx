import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Camera, Upload, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useForm } from "react-hook-form";
import { supabase } from "./supabase-client"; // Make sure this path is correct for your project

// Color scheme constants
const colors = {
  black: "bg-black",
  primary: "bg-[#CF0F47]",
  secondary: "bg-[#FF0B55]",
  light: "bg-[#FFDEDE]",
  textLight: "text-[#FFDEDE]",
  textDark: "text-black",
};

function LostPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  const form = useForm({
    defaultValues: {
      rollNo: "",
      description: "",
      place: "",
      contact: "",
      currentLocation: "",
    },
  });

  const handleImageChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file); // Store the actual file for upload
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImagePreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload image to Supabase storage
  const uploadImg = async (file: File) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage
      .from("found-items-images") // Changed to found-items-images
      .upload(filePath, file);

    if (error) {
      console.error("Upload Error: ", error.message);
      return null;
    }

    const { data } = await supabase.storage
      .from("found-items-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setError("");

    let imageURL = "";
    if (imageFile) {
      imageURL = (await uploadImg(imageFile)) || "";
      console.log(imageURL);
    }

    try {
      const { error } = await supabase
        .from("LOST_TABLE") // Using LOST_TABLE as specified
        .insert({
          personRollno: data.rollNo,
          description: data.description,
          itemImageURL: imageURL,
          placeWhereLost: data.place,
          PersonContact: data.contact, // Matches your interface
          dateLost: new Date().toISOString(),
          stillMissing: "searching", // Default status as per your interface
        });

      if (error) {
        console.error("Insert Error: ", error);
        setError("Failed to submit your lost item report. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Show success message
      setShowSuccess(true);

      // Reset form after success
      setTimeout(() => {
        form.reset();
        setImagePreview(null);
        setImageFile(null);
        setShowSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error submitting form:", err);
      setError("Failed to submit your lost item report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Header */}
      <header className="py-8 px-8 bg-[#CF0F47] text-white rounded-xl mx-10 my-4">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl text-center font-bold text-white">
            LOST ITEM REQUEST
          </h1>
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-3xl"
        >
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

          {error && (
            <Alert className="mb-6 bg-red-100 border-red-500 text-red-800">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {showSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Alert className="bg-green-100 border-green-500 text-green-800">
                <AlertDescription className="flex items-center justify-center py-4">
                  <div className="text-center">
                    <div className="mb-2 flex justify-center">
                      <div className="rounded-full bg-green-200 p-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-green-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-lg font-medium">
                      Lost Item Report Submitted!
                    </h3>
                    <p className="mt-2">
                      Your lost item has been reported. We hope someone finds it
                      soon!
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            </motion.div>
          ) : (
            <Card className="shadow-xl border-gray-800 bg-gray-950 text-gray-100">
              <CardHeader className="border-b border-gray-800 bg-gray-950 rounded-t-lg">
                <CardTitle className="text-2xl font-bold text-white">
                  Report a Lost Item
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Submit the details of your missing item below
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    {/* Roll Number */}
                    <FormField
                      name="rollNo"
                      control={form.control}
                      rules={{ required: "Roll number is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">
                            Your Roll Number
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your roll number"
                              className="bg-gray-800 border-gray-700 text-white focus:ring-[#FF0B55] focus:border-[#FF0B55]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Item Description */}
                    <FormField
                      name="description"
                      control={form.control}
                      rules={{ required: "Description is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">
                            Item Description
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the lost item in detail (color, brand, identifying features, etc.)"
                              className="bg-gray-800 border-gray-700 text-white focus:ring-[#FF0B55] focus:border-[#FF0B55]"
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Item Image */}
                    <div className="space-y-2">
                      <FormLabel className="text-gray-300">
                        Item Image (optional)
                      </FormLabel>
                      <div className="border-2 border-dashed border-gray-700 rounded-lg overflow-hidden">
                        {imagePreview ? (
                          <div className="relative group">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-48 object-contain bg-gray-950"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <label
                                htmlFor="image"
                                className="cursor-pointer flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-md"
                              >
                                <Camera className="h-5 w-5" />
                                <span>Change Image</span>
                              </label>
                            </div>
                          </div>
                        ) : (
                          <label
                            htmlFor="image"
                            className="flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-gray-800 transition-colors"
                          >
                            <Upload className="h-10 w-10 text-gray-500 mb-2" />
                            <span className="text-center text-gray-400">
                              Click to upload an image of the lost item
                            </span>
                          </label>
                        )}
                        <input
                          type="file"
                          id="image"
                          name="image"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </div>
                    </div>
                    {/* Place Where Lost */}
                    <FormField
                      name="place"
                      control={form.control}
                      rules={{ required: "Location is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">
                            Place where item was lost
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Building, room, etc."
                              className="bg-gray-800 border-gray-700 text-white focus:ring-[#FF0B55] focus:border-[#FF0B55]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Contact Information */}
                    <FormField
                      name="contact"
                      control={form.control}
                      rules={{ required: "Contact information is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">
                            Contact Information
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Phone number or email where you can be reached"
                              className="bg-gray-800 border-gray-700 text-white focus:ring-[#FF0B55] focus:border-[#FF0B55]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-gray-500">
                            This will be used by the person who finds the item
                            to contact you.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator className="my-2 bg-gray-800" />

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-6 ${colors.primary} hover:bg-[#FF0B55] text-white font-medium transition-colors`}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Processing...
                        </div>
                      ) : (
                        "Submit Lost Item Report"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer
        className={`py-4 px-8 bg-[#CF0F47] border-t border-[#CF0F47] rounded-xl mx-10 my-4`}
      >
        <div className="text-center">
          <p className={`text-white text-sm`}>
            © {new Date().getFullYear()} Campus Finder. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LostPage;
