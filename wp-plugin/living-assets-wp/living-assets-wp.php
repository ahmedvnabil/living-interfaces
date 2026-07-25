<?php
/**
 * Plugin Name:       Living Assets
 * Plugin URI:        https://zad.tools/living-assets
 * Description:       40 generative visualization modules as Gutenberg blocks and shortcodes — flow fields, physarum, terrain, knowledge graphs and more, rendered live on canvas with your theme's colors.
 * Version:           1.0.0
 * Requires at least: 6.5
 * Requires PHP:      8.0
 * Author:            Ahmed Nabil
 * License:           GPL v2 or later
 * Text Domain:       living-assets-wp
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

define( 'LAWP_VERSION', '1.0.0' );
define( 'LAWP_PATH', plugin_dir_path( __FILE__ ) );
define( 'LAWP_URL', plugin_dir_url( __FILE__ ) );
define( 'LAWP_SLUG', 'living-assets-wp' );

require_once LAWP_PATH . 'includes/catalog.php';
require_once LAWP_PATH . 'includes/class-assets.php';
require_once LAWP_PATH . 'includes/class-shortcode.php';
require_once LAWP_PATH . 'includes/class-block.php';
require_once LAWP_PATH . 'includes/class-plugin.php';

add_action( 'plugins_loaded', static function () {
	\LAWP\Plugin::instance()->run();
} );
