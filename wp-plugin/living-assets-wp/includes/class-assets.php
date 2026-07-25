<?php
namespace LAWP;

if ( ! defined( 'ABSPATH' ) ) { exit; }

/**
 * Script/style registration, and the import map that lets library modules
 * resolve `three` / `gsap` / `mp4-muxer` from the plugin's vendored copies.
 * No CDN requests are made.
 */
class Assets {

	/** Set to true by shortcodes/blocks when something on the page needs mounting. */
	private bool $needed = false;

	public function register(): void {
		add_action( 'init', [ $this, 'register_assets' ] );
		// Import map must precede any module execution; head, early.
		add_action( 'wp_head', [ $this, 'print_import_map' ], 5 );
		add_action( 'wp_footer', [ $this, 'maybe_enqueue' ], 5 );
	}

	public function register_assets(): void {
		wp_register_style(
			'lawp-embed',
			LAWP_URL . 'public/assets/living-assets.css',
			[],
			LAWP_VERSION
		);
		wp_register_script_module(
			'lawp-mount',
			LAWP_URL . 'public/assets/mount.js',
			[],
			LAWP_VERSION
		);
	}

	/** Called by renderers so assets are only loaded on pages that use them. */
	public function mark_needed(): void {
		$this->needed = true;
		// Styles can still enqueue mid-body; WP prints them in the footer.
		wp_enqueue_style( 'lawp-embed' );
		wp_enqueue_script_module( 'lawp-mount' );
	}

	public function maybe_enqueue(): void {
		if ( ! $this->needed ) {
			return;
		}
		wp_enqueue_style( 'lawp-embed' );
		wp_enqueue_script_module( 'lawp-mount' );
	}

	/**
	 * Printed on every page: a bare JSON script tag (~250 bytes) that costs no
	 * network requests unless a module actually imports one of these names.
	 */
	public function print_import_map(): void {
		$vendor = LAWP_URL . 'public/assets/la/vendor/';
		$map    = [
			'imports' => [
				'three'     => $vendor . 'three.module.js',
				'gsap'      => $vendor . 'gsap.min.js',
				'mp4-muxer' => $vendor . 'mp4-muxer.min.mjs',
			],
		];
		printf(
			'<script type="importmap">%s</script>' . "\n",
			wp_json_encode( $map )
		);
	}
}
