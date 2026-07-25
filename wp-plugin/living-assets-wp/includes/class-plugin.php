<?php
namespace LAWP;

if ( ! defined( 'ABSPATH' ) ) { exit; }

/** Main plugin singleton: wires assets, shortcodes and blocks. */
final class Plugin {

	private static ?Plugin $instance = null;

	public Assets $assets;
	public Shortcode $shortcode;
	public Block $block;

	public static function instance(): Plugin {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	private function __construct() {
		$this->assets    = new Assets();
		$this->shortcode = new Shortcode( $this->assets );
		$this->block     = new Block( $this->assets, $this->shortcode );
	}

	public function run(): void {
		$this->assets->register();
		$this->shortcode->register();
		$this->block->register();
	}
}
