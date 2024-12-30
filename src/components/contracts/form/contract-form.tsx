"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { executeContractWorkflow } from "@/lib/langchain/orchestration/contract-workflow"

// Define form schema
const contractFormSchema = z.object({
  propertyDetails: z.object({
    address: z.string().min(1, "Address is required"),
    propertyType: z.string().min(1, "Property type is required"),
    price: z.string().min(1, "Price is required"),
    bedrooms: z.number().optional(),
    bathrooms: z.number().optional(),
    squareFeet: z.number().optional(),
    yearBuilt: z.number().optional(),
    lotSize: z.string().optional(),
  }),
  buyerInfo: z.object({
    name: z.string().min(1, "Buyer name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    currentAddress: z.string().optional(),
  }),
  offerTerms: z.object({
    offerPrice: z.string().min(1, "Offer price is required"),
    earnestMoney: z.string().min(1, "Earnest money is required"),
    closingDate: z.string().min(1, "Closing date is required"),
    contingencies: z.array(z.string()).min(1, "At least one contingency is required"),
    additionalTerms: z.array(z.string()).optional(),
  }),
  jurisdiction: z.string().min(1, "Jurisdiction is required"),
})

type ContractFormValues = z.infer<typeof contractFormSchema>

// Default values
const defaultValues: Partial<ContractFormValues> = {
  propertyDetails: {
    propertyType: "residential",
  },
  offerTerms: {
    contingencies: ["financing", "inspection"],
  },
}

interface ContractFormProps {
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

export function ContractForm({ onSuccess, onError }: ContractFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = React.useState(false)

  // Initialize form
  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractFormSchema),
    defaultValues,
  })

  // Form submission handler
  async function onSubmit(data: ContractFormValues) {
    try {
      setIsLoading(true)

      // Execute contract generation workflow
      const result = await executeContractWorkflow({
        action: "generate",
        data: {
          contractInput: data,
        },
        options: {
          includeSimilarContracts: true,
          validateResults: true,
        },
      })

      if (result.status === "failed") {
        throw new Error(result.error || "Contract generation failed")
      }

      toast({
        title: "Contract Generated",
        description: "Your contract has been generated successfully.",
      })

      onSuccess?.(result.results)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred"
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      })

      onError?.(error instanceof Error ? error : new Error(errorMessage))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Property Details Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Property Details</h3>
          
          <FormField
            control={form.control}
            name="propertyDetails.address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main St, City, State, ZIP" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="propertyDetails.propertyType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Type</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="propertyDetails.price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Listing Price</FormLabel>
                  <FormControl>
                    <Input placeholder="$500,000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Buyer Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Buyer Information</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="buyerInfo.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="buyerInfo.email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Offer Terms Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Offer Terms</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="offerTerms.offerPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Offer Price</FormLabel>
                  <FormControl>
                    <Input placeholder="$495,000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="offerTerms.earnestMoney"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Earnest Money</FormLabel>
                  <FormControl>
                    <Input placeholder="$5,000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="offerTerms.closingDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Closing Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Jurisdiction Section */}
        <FormField
          control={form.control}
          name="jurisdiction"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jurisdiction</FormLabel>
              <FormControl>
                <Input placeholder="e.g., California" {...field} />
              </FormControl>
              <FormDescription>
                The state or jurisdiction where this contract will be executed.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Generating Contract..." : "Generate Contract"}
        </Button>
      </form>
    </Form>
  )
} 