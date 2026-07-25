<?php
namespace LAWP;

if ( ! defined( 'ABSPATH' ) ) { exit; }

/**
 * [living_asset module="flow-field" height="480px" seed="42" params='{"count":2000}' theme="dark"]
 * [living_story height="100vh"]{...scenes JSON...}[/living_story]
 */
class Shortcode {

	public function __construct( private Assets $assets ) {}

	public function register(): void {
		add_shortcode( 'living_asset', [ $this, 'render_asset' ] );
		add_shortcode( 'living_story', [ $this, 'render_story' ] );
	}

	/** Height values like 480px / 70vh / 100% only. */
	private function sanitize_height( string $height ): string {
		return preg_match( '/^\d{1,4}(\.\d+)?(px|vh|vw|rem|em|%)$/', $height ) ? $height : '480px';
	}

	/** Keep only whitelisted-module params with numeric values. */
	private function sanitize_params( string $json ): array {
		$decoded = json_decode( $json, true );
		if ( ! is_array( $decoded ) ) {
			return [];
		}
		$clean = [];
		foreach ( $decoded as $key => $value ) {
			if ( is_string( $key ) && preg_match( '/^[a-zA-Z]{1,32}$/', $key ) && is_numeric( $value ) ) {
				$clean[ $key ] = (float) $value;
			}
		}
		return $clean;
	}

	/** Shared renderer used by both the shortcode and the block. */
	public function asset_markup( array $args ): string {
		$module = isset( $args['module'] ) ? sanitize_key( $args['module'] ) : '';
		if ( ! lawp_module_exists( $module ) ) {
			return current_user_can( 'edit_posts' )
				? '<p>' . esc_html__( 'Living Assets: unknown module.', 'living-assets-wp' ) . '</p>'
				: '';
		}
		$this->assets->mark_needed();

		$height = $this->sanitize_height( (string) ( $args['height'] ?? '480px' ) );
		$seed   = isset( $args['seed'] ) && '' !== $args['seed'] ? absint( $args['seed'] ) : '';
		$params = is_array( $args['params'] ?? null )
			? $args['params']
			: $this->sanitize_params( (string) ( $args['params'] ?? '' ) );
		$theme  = in_array( $args['theme'] ?? '', [ 'dark', 'light' ], true ) ? $args['theme'] : '';
		$class  = sanitize_html_class( (string) ( $args['class'] ?? '' ) );

		return sprintf(
			'<div class="la-embed %1$s" style="height:%2$s" data-la-module="%3$s"%4$s%5$s%6$s aria-label="%7$s" role="img"></div>',
			esc_attr( $class ),
			esc_attr( $height ),
			esc_attr( $module ),
			'' !== $seed ? ' data-la-seed="' . esc_attr( (string) $seed ) . '"' : '',
			! empty( $params ) ? " data-la-params='" . esc_attr( wp_json_encode( $params ) ) . "'" : '',
			'' !== $theme ? ' data-la-theme="' . esc_attr( $theme ) . '"' : '',
			/* translators: %s: module name */
			esc_attr( sprintf( __( 'Generative visualization: %s', 'living-assets-wp' ), lawp_module_label( $module ) ) )
		);
	}

	public function render_asset( $atts ): string {
		$atts = shortcode_atts(
			[
				'module' => '',
				'height' => '480px',
				'seed'   => '',
				'params' => '',
				'theme'  => '',
				'class'  => '',
			],
			$atts,
			'living_asset'
		);
		return $this->asset_markup( $atts );
	}

	/** Validate a LivingStory scenes payload down to a safe structure. */
	public function sanitize_scenes( string $json ): array {
		$decoded = json_decode( $json, true );
		$scenes  = is_array( $decoded ) ? ( $decoded['scenes'] ?? $decoded ) : [];
		if ( ! is_array( $scenes ) ) {
			return [];
		}
		$clean = [];
		foreach ( array_slice( $scenes, 0, 12 ) as $scene ) {
			if ( ! is_array( $scene ) ) {
				continue;
			}
			$module = sanitize_key( $scene['module'] ?? '' );
			$module = str_replace( [ 'simulations/', '.js' ], '', $module );
			if ( ! lawp_module_exists( $module ) ) {
				continue;
			}
			$entry = [
				'module'   => 'simulations/' . $module . '.js',
				'headline' => sanitize_text_field( (string) ( $scene['headline'] ?? '' ) ),
				'body'     => sanitize_text_field( (string) ( $scene['body'] ?? '' ) ),
			];
			if ( isset( $scene['seed'] ) && is_numeric( $scene['seed'] ) ) {
				$entry['seed'] = absint( $scene['seed'] );
			}
			foreach ( [ 'from', 'to' ] as $side ) {
				if ( is_array( $scene[ $side ] ?? null ) ) {
					$entry[ $side ] = $this->sanitize_params( (string) wp_json_encode( $scene[ $side ] ) );
				}
			}
			if ( in_array( $scene['theme'] ?? '', [ 'dark', 'light' ], true ) ) {
				$entry['theme'] = $scene['theme'];
			}
			$clean[] = $entry;
		}
		return $clean;
	}

	public function render_story( $atts, ?string $content = null ): string {
		$scenes = $this->sanitize_scenes( (string) $content );
		if ( empty( $scenes ) ) {
			return current_user_can( 'edit_posts' )
				? '<p>' . esc_html__( 'Living Story: no valid scenes.', 'living-assets-wp' ) . '</p>'
				: '';
		}
		$this->assets->mark_needed();
		return sprintf(
			'<div class="la-story" data-la-story><script type="application/json">%s</script></div>',
			wp_json_encode( $scenes, JSON_UNESCAPED_UNICODE )
		);
	}
}
