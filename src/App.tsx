import { useState, useEffect } from "react"
import { Button } from "./components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "./components/ui/input"
import { Separator } from "./components/ui/separator"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BASE_URL } from "./config/api"

type Prediction = {
  id: string
  image: string
  label: string
  confidence: number
}

type PredictResponse = {
  status: string
  message: string
  data: {
    disease: string
    confidenceScore: number
  }
}

export function App() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PredictResponse | null>(null)
  const [error, setError] = useState("")
  const [predictions, setPredictions] = useState<Prediction[]>([])

  const handlePredict = async () => {
    if (!file) {
      setError("Please select an image first.")
      return
    }

    try {
      setLoading(true)
      setError("")
      setResult(null)

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`${BASE_URL}/predict`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to predict")
      }

      const data: PredictResponse = await response.json()

      setResult(data)
      fetchPredictionHistory()
    } catch (err) {
      console.error(err)
      setError("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  const fetchPredictionHistory = async () => {
    try {
      const response = await fetch(`${BASE_URL}/predict-history`)

      if (!response.ok) {
        throw new Error("Failed to fetch history")
      }

      const data = await response.json()

      setPredictions(data.data)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchPredictionHistory()
  }, [])

  return (
    <div className="flex justify-center border">
      <div className="flex min-h-svh w-3xl flex-col border p-6">
        <div className="w-fit">
          <h1 className="text-lg font-semibold">Skin Disease Classification</h1>
          <Separator />
        </div>

        <div className="mt-8 flex flex-col gap-6">
          <div className="w-fit">
            <h1 className="text-sm font-medium">Predict</h1>
            <Separator />
          </div>

          <Field>
            <FieldLabel htmlFor="file">Image File</FieldLabel>

            <Input
              id="file"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0]

                if (selectedFile) {
                  setFile(selectedFile)
                }
              }}
            />

            <FieldDescription>Select an image to upload.</FieldDescription>

            <Button className="mt-4" onClick={handlePredict} disabled={loading}>
              {loading ? "Predicting..." : "Predict"}
            </Button>
          </Field>

          {error && (
            <div className="rounded-md border border-red-500 p-4 text-sm text-red-500">
              {error}
            </div>
          )}

          {result && (
            <div className="rounded-md border p-4">
              <h2 className="mb-4 text-base font-semibold">
                Prediction Result
              </h2>

              <div className="flex flex-col gap-2 text-sm">
                <p>
                  <span className="font-medium">Disease:</span>{" "}
                  {result.data.disease}
                </p>

                <p>
                  <span className="font-medium">Confidence:</span>{" "}
                  {(result.data.confidenceScore * 100).toFixed(2)}%
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="mt-8 flex flex-col gap-2">
          <div className="w-fit">
            <h1 className="text-sm font-medium">Prediction History</h1>
            <Separator />
          </div>
          <div>
            <Table>
              <TableCaption>A list of your recent predictions.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-25">ID</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Confidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {predictions?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell className="font-medium">
                      <img
                        src={`${BASE_URL}/image/${item.image}`}
                        alt="image"
                        className="h-16 w-16"
                      />
                    </TableCell>
                    <TableCell>{item.label}</TableCell>
                    <TableCell>{item.confidence}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
