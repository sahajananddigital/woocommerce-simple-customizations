<?php
/**
 * Cart Limit Module
 *
 * @package WSC
 */

defined( 'ABSPATH' ) || exit;

class WSC_Cart_Limit {

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'woocommerce_check_cart_items', array( $this, 'check_cart_limits' ) );
	}

	/**
	 * Check cart limits.
	 */
	public function check_cart_limits() {
		$settings = get_option( 'wsc_settings', array() );

		// Check if enabled
		if ( empty( $settings['cart_limit_enabled'] ) ) {
			return;
		}

		$rule_type = isset( $settings['cart_limit_rule_type'] ) ? $settings['cart_limit_rule_type'] : 'global';
		$term_id   = isset( $settings['cart_limit_term_id'] ) ? absint( $settings['cart_limit_term_id'] ) : 0;
		$min_qty   = isset( $settings['cart_limit_min_qty'] ) ? absint( $settings['cart_limit_min_qty'] ) : 0;

		if ( ! $min_qty ) {
			return;
		}

		// Term ID is required only if not global
		if ( 'global' !== $rule_type && ! $term_id ) {
			return;
		}

		$current_qty = 0;
		$term_name   = '';

		// Calculate Quantity
		foreach ( WC()->cart->get_cart() as $cart_item ) {
			$product_id = $cart_item['product_id'];
			
			if ( 'global' === $rule_type ) {
				$current_qty += $cart_item['quantity'];
			} elseif ( 'category' === $rule_type ) {
				if ( has_term( $term_id, 'product_cat', $product_id ) ) {
					$current_qty += $cart_item['quantity'];
				}
			} elseif ( 'tag' === $rule_type ) {
				if ( has_term( $term_id, 'product_tag', $product_id ) ) {
					$current_qty += $cart_item['quantity'];
				}
			}
		}

		// Validation
		if ( $current_qty > 0 && $current_qty < $min_qty ) {
			if ( 'global' === $rule_type ) {
				/* translators: %s: Minimum Quantity */
				$message = sprintf( __( 'You must purchase at least %s items in total to proceed.', 'woocommerce-simple-customizations' ), $min_qty );
			} else {
				$term = get_term( $term_id, $rule_type === 'category' ? 'product_cat' : 'product_tag' );
				$term_name = $term && ! is_wp_error( $term ) ? $term->name : 'Selected Items';
				
				/* translators: 1: Minimum Quantity, 2: Term Name */
				$message = sprintf( __( 'You must purchase at least %1$s items from "%2$s" to proceed.', 'woocommerce-simple-customizations' ), $min_qty, $term_name );
			}

			wc_add_notice( $message, 'error' );
		}
	}
}

new WSC_Cart_Limit();
