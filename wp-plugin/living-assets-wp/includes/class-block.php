<?php
namespace LAWP;

if ( ! defined( 'ABSPATH' ) ) { exit; }

/** Registers the two Gutenberg blocks; rendering reuses the shortcode logic. */
class Block {

	public function __construct( private Assets $assets, private Shortcode $shortcode ) {}

	public function register(): void {
		add_action( 'init', [ $this, 'register_blocks' ] );
		add_action( 'enqueue_block_editor_assets', [ $this, 'editor_data' ] );
	}

	public function register_blocks(): void {
		register_block_type(
			LAWP_PATH . 'blocks/living-asset',
			[ 'render_callback' => [ $this, 'render_asset_block' ] ]
		);
		register_block_type(
			LAWP_PATH . 'blocks/living-story',
			[ 'render_callback' => [ $this, 'render_story_block' ] ]
		);
	}

	/** Expose the module catalog to the editor UI. */
	public function editor_data(): void {
		wp_localize_script(
			'lawp-living-asset-editor-script',
			'LAWP_CATALOG',
			[ 'modules' => lawp_catalog() ]
		);
	}

	public function render_asset_block( array $attributes ): string {
		return $this->shortcode->asset_markup(
			[
				'module' => $attributes['module'] ?? '',
				'height' => $attributes['height'] ?? '480px',
				'seed'   => $attributes['seed'] ?? '',
				'params' => $attributes['params'] ?? '',
				'theme'  => $attributes['theme'] ?? '',
				'class'  => $attributes['className'] ?? '',
			]
		);
	}

	public function render_story_block( array $attributes ): string {
		return $this->shortcode->render_story( [], (string) ( $attributes['scenes'] ?? '' ) );
	}
}
