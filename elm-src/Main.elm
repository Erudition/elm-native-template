module Main exposing (main)

import Browser
import Html exposing (Attribute, Html, node)
import Html.Attributes exposing (attribute)
import Html.Events exposing (onClick)



-- Just a demo, copied from Ellie


type alias Model =
    { count : Int }


initialModel : Model
initialModel =
    { count = 0 }


type Msg
    = Increment
    | Decrement


update : Msg -> Model -> Model
update msg model =
    case msg of
        Increment ->
            { model | count = model.count + 1 }

        Decrement ->
            { model | count = model.count - 1 }


view : Model -> Html Msg
view model =
    page []
        [ stackLayout [] [ label [ text "Hello World!" ] [] ]
        ]



--
-- [ button [ onClick Increment ] [ text "+1" ]
-- , div [] [ text <| String.fromInt model.count ]
-- , button [ onClick Decrement ] [ text "-1" ]
-- ]


page : List (Attribute msg) -> List (Html msg) -> Html msg
page attributes children =
    node "Page" attributes children


stackLayout : List (Attribute msg) -> List (Html msg) -> Html msg
stackLayout attributes children =
    node "StackLayout" attributes children


label : List (Attribute msg) -> List (Html msg) -> Html msg
label attributes children =
    node "Label" attributes children


text : String -> Attribute msg
text string =
    attribute "text" string


main : Program () Model Msg
main =
    Browser.sandbox
        { init = initialModel
        , view = view
        , update = update
        }
