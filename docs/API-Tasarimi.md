# API Tasarımı - OpenAPI Specification

**OpenAPI Spesifikasyon Dosyası:** [openapi.yaml](openapi.yaml)

Bu doküman, SolveIt (Kampüs ve Şehir Sorun Bildirim Sistemi) projesi için OpenAPI Specification (OAS) 3.0 standardına göre hazırlanmış API tasarımını içermektedir.

## OpenAPI Specification

```yaml
openapi: 3.0.3
info:
  title: SolveIt API
  description: |
    Süleyman Demirel Üniversitesi kampüsü ve Isparta şehri için geliştirilmiş sorun bildirim platformu RESTful API'si.
    
    ## Özellikler
    - Kullanıcı Kimlik Doğrulama (JWT)
    - Sorun Bildirimi ve Konum Takibi
    - Statü Yönetimi (Beklemede, Çözüldü vb.)
    - Kategori Bazlı Filtreleme
  version: 1.0.0
  contact:
    name: Ceyhun Başkoç
    email: ceyhun@sdu.edu.tr
    url: https://github.com/ceyhunbaskoc/solveit

servers:
  - url: http://localhost:5000/api
    description: Yerel Geliştirme Sunucusu (Development)

tags:
  - name: auth
    description: Kimlik doğrulama ve kayıt işlemleri
  - name: issues
    description: Sorun bildirimleri ve listeleme işlemleri
  - name: users
    description: Kullanıcı profil işlemleri

paths:
  /auth/register:
    post:
      tags:
        - auth
      summary: Yeni kullanıcı kaydı
      description: Sisteme yeni bir öğrenci veya vatandaş kaydeder.
      operationId: registerUser
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserRegistration'
      responses:
        '201':
          description: Kullanıcı başarıyla oluşturuldu
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthToken'
        '400':
          $ref: '#/components/responses/BadRequest'

  /auth/login:
    post:
      tags:
        - auth
      summary: Kullanıcı girişi
      description: Email ve şifre ile giriş yapar, JWT token döner.
      operationId: loginUser
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginCredentials'
      responses:
        '200':
          description: Giriş başarılı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthToken'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /issues:
    get:
      tags:
        - issues
      summary: Tüm sorunları listele
      description: Sistemdeki tüm aktif sorunları kronolojik olarak listeler. Kategoriye göre filtrelenebilir.
      operationId: listIssues
      parameters:
        - name: category
          in: query
          description: Kategoriye göre filtrele (Örn. Teknik, Temizlik)
          schema:
            type: string
      responses:
        '200':
          description: Başarılı
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Issue'
    
    post:
      tags:
        - issues
      summary: Yeni sorun bildir
      description: Kampüs veya şehirdeki bir sorunu konumuyla birlikte sisteme kaydeder.
      operationId: createIssue
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/IssueCreate'
      responses:
        '201':
          description: Sorun başarıyla oluşturuldu
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Issue'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /issues/my-issues:
    get:
      tags:
        - issues
      summary: Kişisel bildirimleri getir
      description: Giriş yapmış kullanıcının kendi açtığı sorun kayıtlarını listeler.
      operationId: listMyIssues
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Başarılı
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Issue'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /issues/{id}:
    get:
      tags:
        - issues
      summary: Sorun detayını getir
      description: Spesifik bir sorunun tüm detaylarını getirir.
      operationId: getIssueById
      parameters:
        - $ref: '#/components/parameters/IssueIdParam'
      responses:
        '200':
          description: Başarılı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Issue'
        '404':
          $ref: '#/components/responses/NotFound'

    delete:
      tags:
        - issues
      summary: Sorunu sil
      description: Hatalı açılmış bir sorun kaydını siler.
      operationId: deleteIssue
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/IssueIdParam'
      responses:
        '204':
          description: Sorun başarıyla silindi
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'
        '404':
          $ref: '#/components/responses/NotFound'

  /issues/{id}/status:
    patch:
      tags:
        - issues
      summary: Sorun durumunu güncelle (Admin)
      description: Yetkili kullanıcının sorunun çözüm durumunu güncellemesini sağlar.
      operationId: updateIssueStatus
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/IssueIdParam'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  enum: [PENDING, IN_PROGRESS, RESOLVED]
      responses:
        '200':
          description: Durum başarıyla güncellendi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Issue'
        '403':
          $ref: '#/components/responses/Forbidden'

  /users/profile:
    put:
      tags:
        - users
      summary: Profil güncelle
      description: Kullanıcının kendi profil bilgilerini güncellemesini sağlar.
      operationId: updateProfile
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserUpdate'
      responses:
        '200':
          description: Profil başarıyla güncellendi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '401':
          $ref: '#/components/responses/Unauthorized'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT token ile kimlik doğrulama

  parameters:
    IssueIdParam:
      name: id
      in: path
      required: true
      description: Sorunun MongoDB ObjectID'si
      schema:
        type: string

  schemas:
    User:
      type: object
      properties:
        _id:
          type: string
          description: Kullanıcı benzersiz kimliği (MongoDB)
        name:
          type: string
          example: "Ceyhun Başkoç"
        email:
          type: string
          format: email
          example: "ceyhun@sdu.edu.tr"
        role:
          type: string
          enum: [admin, user]
          example: "user"
        department:
          type: string
          example: "Bilgisayar Mühendisliği"

    UserRegistration:
      type: object
      required:
        - name
        - email
        - password
      properties:
        name:
          type: string
          example: "Ceyhun Başkoç"
        email:
          type: string
          format: email
          example: "ceyhun@sdu.edu.tr"
        password:
          type: string
          format: password
          minLength: 6
          example: "Guvenli123!"

    LoginCredentials:
      type: object
      required:
        - email
        - password
      properties:
        email:
          type: string
          format: email
          example: "ceyhun@sdu.edu.tr"
        password:
          type: string
          format: password
          example: "Guvenli123!"

    AuthToken:
      type: object
      properties:
        success:
          type: boolean
          example: true
        token:
          type: string
          description: JWT access token
        role:
          type: string
          example: "user"

    UserUpdate:
      type: object
      properties:
        name:
          type: string
          example: "Ceyhun Başkoç"
        department:
          type: string
          example: "Yazılım Mühendisliği"

    Issue:
      type: object
      properties:
        _id:
          type: string
        title:
          type: string
          example: "Kütüphane Priz Arızası"
        description:
          type: string
          example: "2. kat çalışma alanındaki prizler elektrik vermiyor."
        category:
          type: string
          example: "Teknik"
        location:
          type: object
          properties:
            latitude:
              type: number
              example: 37.8322
            longitude:
              type: number
              example: 30.5260
        status:
          type: string
          enum: [PENDING, IN_PROGRESS, RESOLVED]
          example: "PENDING"
        reporterId:
          type: string
          description: Bildiren kullanıcının ID'si
        createdAt:
          type: string
          format: date-time

    IssueCreate:
      type: object
      required:
        - title
        - description
        - category
      properties:
        title:
          type: string
          example: "Kütüphane Priz Arızası"
        description:
          type: string
          example: "2. kat çalışma alanındaki prizler elektrik vermiyor."
        category:
          type: string
          example: "Teknik"
        location:
          type: object
          properties:
            latitude:
              type: number
              example: 37.8322
            longitude:
              type: number
              example: 30.5260

    Error:
      type: object
      properties:
        success:
          type: boolean
          example: false
        message:
          type: string
          example: "Hata detayı burada yer alır."

  responses:
    BadRequest:
      description: Geçersiz istek
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    Unauthorized:
      description: Yetkisiz erişim (Token eksik veya geçersiz)
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    NotFound:
      description: Kaynak bulunamadı
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    Forbidden:
      description: Erişim reddedildi (Rol yetersiz)
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
```