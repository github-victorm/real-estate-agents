import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ContractCardProps {
  title: string
  description: string
  status: 'draft' | 'pending' | 'completed'
  date: string
  onView?: () => void
  onEdit?: () => void
}

export function ContractCard({ 
  title, 
  description, 
  status, 
  date, 
  onView, 
  onEdit 
}: ContractCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{title}</CardTitle>
          <span className={`px-2 py-1 rounded-full text-sm ${
            status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
            status === 'pending' ? 'bg-blue-100 text-blue-800' :
            'bg-green-100 text-green-800'
          }`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
        <CardDescription>{date}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{description}</p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {onView && (
          <Button variant="outline" onClick={onView}>
            View
          </Button>
        )}
        {onEdit && (
          <Button onClick={onEdit}>
            Edit
          </Button>
        )}
      </CardFooter>
    </Card>
  )
} 