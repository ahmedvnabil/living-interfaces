/* Living Story block — scenes JSON editor, vanilla wp.element. */
( function ( wp ) {
	const { registerBlockType } = wp.blocks;
	const { createElement: el } = wp.element;
	const { useBlockProps } = wp.blockEditor;
	const { TextareaControl } = wp.components;
	const { __ } = wp.i18n;

	const EXAMPLE = JSON.stringify(
		{
			scenes: [
				{ module: 'noise-field', headline: 'I. The field', body: 'Scroll to grow the field.', seed: 11, from: { amp: 2 }, to: { amp: 26 } },
				{ module: 'boids', headline: 'II. The flock', body: 'Three rules become a society.', seed: 22, from: { count: 80 }, to: { count: 400 } },
			],
		},
		null,
		2
	);

	registerBlockType( 'lawp/living-story', {
		edit: function ( props ) {
			let sceneCount = 0;
			let parseError = '';
			try {
				const parsed = JSON.parse( props.attributes.scenes || '{}' );
				sceneCount = ( parsed.scenes || parsed || [] ).length || 0;
			} catch ( e ) {
				parseError = e.message;
			}
			const blockProps = useBlockProps( {
				style: { border: '1px solid #22262a', background: '#0a0b0c', color: '#f4f5f4', padding: '20px', fontFamily: 'ui-monospace, monospace' },
			} );
			return el(
				'div',
				blockProps,
				el( 'div', { style: { fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8a9088', marginBottom: '10px' } },
					'Living Story · ' + sceneCount + ' ' + __( 'scenes', 'living-assets-wp' ) +
					( parseError ? ' · ⚠ ' + parseError : '' ) ),
				el( TextareaControl, {
					label: __( 'Scenes JSON', 'living-assets-wp' ),
					help: __( 'Paste from the Living Assets Studio ("Copy setup JSON") or edit by hand.', 'living-assets-wp' ),
					rows: 12,
					value: props.attributes.scenes,
					placeholder: EXAMPLE,
					onChange: function ( v ) { props.setAttributes( { scenes: v } ); },
				} )
			);
		},
		save: function () { return null; },
	} );
} )( window.wp );
