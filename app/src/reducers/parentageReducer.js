export const initialParentageState = {
	sire_id: null,
	sire_tag_id: '',
	dam_id: null,
	dam_tag_id: ''
}

export const parentageReducer = (state, action) => {
	switch (action.type) {
		case 'SET':			
			const data = action.payload.data;
			return {
				sire_id: data.sire_id,
				sire_tag_id: data.sire_tag_id,
				dam_id: data.dam_id,
				dam_tag_id: data.dam_tag_id
			}; 

		case 'CLEAR':
			return {
				sire_id: null,
				sire_tag_id: null,
				dam_id: null,
				dam_tag_id: null
			};
		default:
			return state;
	}
};