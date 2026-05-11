import { useState } from "react"

import { Button } from "./components/ui/button"
import { Field, FieldDescription, FieldLabel } from "./components/ui/field"
import { Input } from "./components/ui/input"
import { Separator } from "./components/ui/separator"

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
      </div>
    </div>
  )
}

export default App
