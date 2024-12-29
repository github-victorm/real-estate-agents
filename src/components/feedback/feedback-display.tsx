import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface FeedbackItem {
  id: string
  rating: string
  comment: string
  improvements?: string
  createdAt: string
}

interface FeedbackDisplayProps {
  feedbackItems: FeedbackItem[]
}

export function FeedbackDisplay({ feedbackItems }: FeedbackDisplayProps) {
  const getRatingColor = (rating: string) => {
    switch (rating.toLowerCase()) {
      case 'excellent':
        return 'text-green-600'
      case 'good':
        return 'text-blue-600'
      case 'fair':
        return 'text-yellow-600'
      case 'poor':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-4">
      {feedbackItems.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Feedback</CardTitle>
              <span className={`font-medium ${getRatingColor(item.rating)}`}>
                {item.rating.charAt(0).toUpperCase() + item.rating.slice(1)}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {new Date(item.createdAt).toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-1">Comment</h4>
              <p className="text-gray-600">{item.comment}</p>
            </div>
            {item.improvements && (
              <div>
                <h4 className="font-medium mb-1">Suggested Improvements</h4>
                <p className="text-gray-600">{item.improvements}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 