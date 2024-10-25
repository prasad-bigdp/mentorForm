const ModuleSelection = ({ modules, onModuleChange }) => {
	return (
		<div className='mb-4'>
			<label className='block text-gray-700'>Module</label>
			<div className='flex'>
				{modules.map((mod) => (
					<div
						key={mod.ModuleID}
						className='mr-4'>
						<input
							type='radio'
							name='module'
							value={mod.ModuleID}
							onChange={() => onModuleChange(mod.ModuleID)}
							className='mr-2'
							id={mod.ModuleID}
						/>
						<label htmlFor={mod.ModuleID}>{mod.ModuleName}</label>
					</div>
				))}
			</div>
		</div>
	)
}

export default ModuleSelection
