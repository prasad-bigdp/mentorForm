import React from "react"
import { FormControl, InputLabel, Select, MenuItem, Box } from "@mui/material"

const BatchSelection = ({ batches, selectedBatch, onBatchChange }) => {
	return (
		<Box sx={{ minWidth: 120, mb: 4 }}>
			<FormControl fullWidth>
				<InputLabel id='batch-select-label'>Select Batch</InputLabel>
				<Select
					labelId='batch-select-label'
					id='batch-select'
					value={selectedBatch || ""} // Ensure controlled component with default value
					label='Select Batch'
					onChange={(e) => onBatchChange(e.target.value)}>
					{batches.map((batch, index) => {
						// Log batches to check if BatchID is unique and defined
						console.log(`Batch:`, batch)

						// Fallback to index as key if BatchID is not defined or not unique
						return (
							<MenuItem
								key={batch.BatchId || index} // Use fallback key if BatchID is undefined
								value={batch.BatchId}>
								{batch.BatchName}
							</MenuItem>
						)
					})}
				</Select>
			</FormControl>
		</Box>
	)
}

export default BatchSelection
