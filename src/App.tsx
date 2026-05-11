import { useState } from "react"

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

type PredictResponse = {
  status: string
  message: string
  data: {
    disease: string
    confidenceScore: number
  }
}

type Prediction = {
  id: string
  image: string
  label: string
  confidence: number
}[]

export function App() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PredictResponse | null>(null)
  const [error, setError] = useState("")

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
      formData.append("image", file)

      const response = await fetch("http://localhost:3000/predict", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to predict")
      }

      const data: PredictResponse = await response.json()

      setResult(data)
    } catch (err) {
      console.error(err)
      setError("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  const predictions: Prediction = [
    {
      id: "PRD-001",
      image:
        "https://storage.googleapis.com/kagglesdsdata/datasets/3655010/6347168/final/test/Vascular%20lesion/ISIC_0024706.jpg?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=databundle-worker-v2%40kaggle-161607.iam.gserviceaccount.com%2F20260511%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20260511T074145Z&X-Goog-Expires=345600&X-Goog-SignedHeaders=host&X-Goog-Signature=0dd09e9f55e1ace510db790c3b9c854199c46ed5f3575de78616ca77e0167104205697960792916727ef4183898ecffbfacdff3bea619147cf09c16c9fe5467d379eba5e494b630d61ad7ca563751f5c6d207077677943997011c48ecd5d1bcc48e115bdda4a672feb98e1e99ff138f875500c16b4bfeeffd018c399a6bad598932daf1e00315cb035c346c87c74c7fdf0b7cbf7b2ff1680408465a1003446539217300ebba3364ff115f9497931dee1a1a5323cb25e75244a5560e9550092ed4d1ee68dc597c1ce29cb7b42993d482b4ff36311e5c410fda89bb9d572e1bae57c725de0f7025ef610e2f6a01da5d2d3b93cbcb0dae650bd8c695cb058e1d24d",
      label: "Vasular Lesion",
      confidence: 97.99,
    },
  ]

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
            <FieldLabel htmlFor="image">Image</FieldLabel>

            <Input
              id="image"
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
                {predictions.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell className="font-medium">
                      <img src={item.image} alt="image" className="h-16 w-16" />
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
