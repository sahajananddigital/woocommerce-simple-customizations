/**
 * External dependencies
 */
import { useState, useEffect } from '@wordpress/element';
import { ToggleControl, SelectControl, TextControl, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';

const CartLimitSettings = ( { settings, updateSetting } ) => {
    const [ terms, setTerms ] = useState( [] );
    const [ isLoadingTerms, setIsLoadingTerms ] = useState( false );

    const ruleType = settings.cart_limit_rule_type || 'global';
    const selectedTerm = settings.cart_limit_term_id || '';
    
    // Fetch terms when rule type changes
    useEffect( () => {
        if ( ruleType === 'global' ) {
            setTerms( [] );
            return;
        }

        setIsLoadingTerms( true );
        const taxonomy = ruleType === 'category' ? 'product_cat' : 'product_tag';
        
        apiFetch( { path: `/wp/v2/${taxonomy}?per_page=100` } ).then( ( data ) => {
            const formattedTerms = data.map( term => ( {
                label: term.name,
                value: term.id
            } ) );
            setTerms( [ { label: __( 'Select Term', 'woocommerce-simple-customizations' ), value: '' }, ...formattedTerms ] );
            setIsLoadingTerms( false );
        } ).catch( error => {
            console.error( error );
            setIsLoadingTerms( false );
        } );
    }, [ ruleType ] );

    return (
        <div className="wsc-cart-limit-settings">
            <h2>{ __( 'Cart Limits', 'woocommerce-simple-customizations' ) }</h2>
            
            <ToggleControl
                label={ __( 'Enable Cart Limit', 'woocommerce-simple-customizations' ) }
                checked={ !! settings.cart_limit_enabled }
                onChange={ ( value ) => updateSetting( 'cart_limit_enabled', value ) }
            />

            { settings.cart_limit_enabled && (
                <>
                    <SelectControl
                        label={ __( 'Rule Based On', 'woocommerce-simple-customizations' ) }
                        value={ ruleType }
                        options={ [
                            { label: 'Global (All Products)', value: 'global' },
                            { label: 'Category', value: 'category' },
                            { label: 'Tag', value: 'tag' },
                        ] }
                        onChange={ ( value ) => updateSetting( 'cart_limit_rule_type', value ) }
                    />

                    { ruleType !== 'global' && (
                        isLoadingTerms ? (
                            <Spinner />
                        ) : (
                            <SelectControl
                                label={ __( 'Select Term', 'woocommerce-simple-customizations' ) }
                                value={ selectedTerm }
                                options={ terms }
                                onChange={ ( value ) => updateSetting( 'cart_limit_term_id', value ) }
                            />
                        )
                    ) }

                    <TextControl
                        label={ __( 'Minimum Quantity', 'woocommerce-simple-customizations' ) }
                        type="number"
                        value={ settings.cart_limit_min_qty || '' }
                        onChange={ ( value ) => updateSetting( 'cart_limit_min_qty', value ) }
                        help={ __( 'Minimum number of items from this category/tag required in the cart.', 'woocommerce-simple-customizations' ) }
                    />
                </>
            ) }
        </div>
    );
};

export default CartLimitSettings;
