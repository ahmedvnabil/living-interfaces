/* Living Asset block — vanilla wp.element, no build step. */
( function ( wp ) {
	const { registerBlockType } = wp.blocks;
	const { createElement: el } = wp.element;
	const { InspectorControls, useBlockProps } = wp.blockEditor;
	const { PanelBody, SelectControl, TextControl, TextareaControl, ToggleControl } = wp.components;
	const { __ } = wp.i18n;

	const catalog = ( window.LAWP_CATALOG && window.LAWP_CATALOG.modules ) || {};
	const options = Object.keys( catalog ).map( function ( id ) {
		return { value: id, label: catalog[ id ].label + ' · ' + catalog[ id ].renderer };
	} );

	registerBlockType( 'lawp/living-asset', {
		edit: function ( props ) {
			const a = props.attributes;
			const meta = catalog[ a.module ] || { label: a.module, subtitle: '', renderer: '' };
			const blockProps = useBlockProps( {
				style: {
					height: a.height || '480px',
					display: 'grid',
					placeItems: 'center',
					background: '#0a0b0c',
					color: '#f4f5f4',
					border: '1px solid #22262a',
					fontFamily: 'ui-monospace, monospace',
					textAlign: 'center',
					padding: '16px',
				},
			} );
			return el(
				'div',
				null,
				el(
					InspectorControls,
					null,
					el(
						PanelBody,
						{ title: __( 'Module', 'living-assets-wp' ), initialOpen: true },
						el( SelectControl, {
							label: __( 'Visualization', 'living-assets-wp' ),
							value: a.module,
							options: options,
							onChange: function ( v ) { props.setAttributes( { module: v } ); },
						} ),
						el( TextControl, {
							label: __( 'Height (px/vh/%)', 'living-assets-wp' ),
							value: a.height,
							onChange: function ( v ) { props.setAttributes( { height: v } ); },
						} ),
						el( TextControl, {
							label: __( 'Seed (empty = random)', 'living-assets-wp' ),
							value: a.seed,
							onChange: function ( v ) { props.setAttributes( { seed: v.replace( /\D/g, '' ) } ); },
						} ),
						el( SelectControl, {
							label: __( 'Theme', 'living-assets-wp' ),
							value: a.theme,
							options: [
								{ value: '', label: __( 'Inherit from site', 'living-assets-wp' ) },
								{ value: 'dark', label: __( 'Dark', 'living-assets-wp' ) },
								{ value: 'light', label: __( 'Light', 'living-assets-wp' ) },
							],
							onChange: function ( v ) { props.setAttributes( { theme: v } ); },
						} ),
						el( ToggleControl, {
							label: __( 'Background mode', 'living-assets-wp' ),
							help: __( 'Fills the parent container and renders behind its content.', 'living-assets-wp' ),
							checked: !! a.background,
							onChange: function ( v ) { props.setAttributes( { background: v } ); },
						} ),
						el( TextareaControl, {
							label: __( 'Parameters (JSON, from Studio "Copy setup JSON")', 'living-assets-wp' ),
							help: __( 'e.g. {"count": 2000, "speed": 1.4}', 'living-assets-wp' ),
							value: a.params,
							onChange: function ( v ) { props.setAttributes( { params: v } ); },
						} )
					)
				),
				el(
					'div',
					blockProps,
					el(
						'div',
						null,
						el( 'div', { style: { fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8a9088' } }, 'Living Asset · ' + meta.renderer ),
						el( 'div', { style: { fontSize: '18px', fontWeight: 600, margin: '6px 0' } }, meta.label ),
						el( 'div', { style: { fontSize: '11px', fontStyle: 'italic', color: '#8a9088' } }, meta.subtitle ),
						el( 'div', { style: { fontSize: '11px', color: '#c6ff4d', marginTop: '10px' } }, __( 'Renders live on the published page', 'living-assets-wp' ) )
					)
				)
			);
		},
		save: function () { return null; }, // dynamic block — server-rendered
	} );
} )( window.wp );
