/**
 * External dependencies
 */
import { useState, useEffect } from '@wordpress/element';
import { Button, Spinner, Notice, TabPanel } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import CartLimitSettings from '../modules/CartLimit/CartLimitSettings';

const SettingsApp = () => {
    const [ settings, setSettings ] = useState( {} );
    const [ isSaving, setIsSaving ] = useState( false );
    const [ isLoading, setIsLoading ] = useState( true );
    const [ notice, setNotice ] = useState( null );

    useEffect( () => {
        apiFetch( { path: '/wsc/v1/settings' } ).then( ( data ) => {
            setSettings( data );
            setIsLoading( false );
        } ).catch( ( error ) => {
            console.error( error );
            setIsLoading( false );
        });
    }, [] );

    const handleSave = () => {
        setIsSaving( true );
        setNotice( null );
        apiFetch( {
            path: '/wsc/v1/settings',
            method: 'POST',
            data: settings,
        } ).then( ( data ) => {
            setSettings( data );
            setIsSaving( false );
            setNotice( { status: 'success', content: __( 'Settings saved.', 'woocommerce-simple-customizations' ) } );
        } ).catch( ( error ) => {
            setIsSaving( false );
            setNotice( { status: 'error', content: error.message } );
        } );
    };

    const updateSetting = ( key, value ) => {
        setSettings( ( prev ) => ( { ...prev, [ key ]: value } ) );
    };

    if ( isLoading ) {
        return <Spinner />;
    }

    return (
        <div className="wsc-settings-app">
            <h1>{ __( 'Simple Customizations', 'woocommerce-simple-customizations' ) }</h1>
            { notice && (
                <Notice status={ notice.status } onRemove={ () => setNotice( null ) }>
                    { notice.content }
                </Notice>
            ) }
            
            <TabPanel
                className="wsc-settings-tabs"
                activeClass="is-active"
                tabs={ [
                    {
                        name: 'cart-limit',
                        title: __( 'Cart Limit', 'woocommerce-simple-customizations' ),
                        className: 'tab-cart-limit',
                    },
                ] }
            >
                { ( tab ) => (
                    <div className="wsc-tab-content">
                        { tab.name === 'cart-limit' && (
                            <CartLimitSettings settings={ settings } updateSetting={ updateSetting } />
                        ) }
                    </div>
                ) }
            </TabPanel>

            <div className="wsc-settings-footer">
                <Button isPrimary isBusy={ isSaving } onClick={ handleSave }>
                    { __( 'Save Changes', 'woocommerce-simple-customizations' ) }
                </Button>
            </div>
        </div>
    );
};

export default SettingsApp;
