Feature: Daily Crossword

  Scenario: トップページからパズルページにリダイレクトされる
    Given トップページを開く
    Then パズルページにリダイレクトされる

  Scenario: クロスワードグリッドが表示される
    Given パズルページを開く
    Then クロスワードグリッドが表示されている
    And "Across" のヒントが表示されている
    And "Down" のヒントが表示されている

  Scenario: セルに文字を入力できる
    Given パズルページを開く
    When グリッドの白いセルをクリックする
    And "S" を入力する
    Then セルに "S" が表示されている

  Scenario: パズルをリセットできる
    Given パズルページを開く
    When グリッドの白いセルをクリックする
    And "S" を入力する
    And "Reset" ボタンをクリックする
    Then すべてのセルが空になっている
